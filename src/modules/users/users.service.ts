import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { QueryUserDto } from './dto/query-user.dto';
import { UtilsService } from 'src/shared/utils/utiles.service';
import { REDIS_CLIENT } from 'src/infra/redis/redis.module';
import Redis from 'ioredis';
import { Inject } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private utilsService: UtilsService,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (await this.findByEmail(createUserDto.email))
      throw new BadRequestException('Email already exists');
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);
    // Sync to Redis
    await this.redis.set(
      `user:${savedUser.id}:name`,
      `${savedUser.firstName} ${savedUser.lastName}`,
    );
    return savedUser;
  }

  async findAll(dto: QueryUserDto) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const query = {};
    if (dto.email) {
      query['email'] = Like(`%${dto.email}%`);
    }
    if (dto.isActive) {
      query['isActive'] = dto.isActive;
    }
    const [users, total] = await this.usersRepository.findAndCount({
      where: query,
      take: limit,
      skip: (page - 1) * limit,
      order: {
        createdAt: 'DESC',
      },
    });
    return this.utilsService.formatPagination({
      items: users,
      page,
      limit,
      total,
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    const savedUser = await this.usersRepository.save(user);
    // Sync to Redis
    await this.redis.set(
      `user:${savedUser.id}:name`,
      `${savedUser.firstName} ${savedUser.lastName}`,
    );
    return savedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async findOneRefreshToken(id: string, refreshToken: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id, refreshToken },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /* 
    We need maintain user data in redis for fast access
    So we need to sync user data to redis periodically
    Using stream data and pipeline for low memory overhead
  */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleBatchUserSync() {
    this.logger.log('Starting batch user sync to Redis...');
    let count = 0;

    try {
      const queryRunner =
        this.usersRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();

      // Using stream for low memory overhead
      const stream = await queryRunner.stream(
        this.usersRepository
          .createQueryBuilder('user')
          .select(['user.id', 'user.firstName', 'user.lastName'])
          .getQuery(),
      );

      let pipeline = this.redis.pipeline();
      const BATCH_SIZE = 1000;

      stream.on('data', async (user: any) => {
        pipeline.set(
          `user:${user.user_id}:name`,
          `${user.user_firstName} ${user.user_lastName}`,
        );
        count++;

        if (count % BATCH_SIZE === 0) {
          const currentPipeline = pipeline;
          pipeline = this.redis.pipeline();
          await currentPipeline.exec();
          this.logger.debug(`Synced ${count} users so far...`);
        }
      });

      stream.on('end', async () => {
        if (count % BATCH_SIZE !== 0) {
          await pipeline.exec();
        }
        this.logger.log(`Batch user sync completed. Synced ${count} users.`);
        queryRunner.release();
      });

      stream.on('error', (err) => {
        this.logger.error('Error during batch user sync', err.stack);
        queryRunner.release();
      });
    } catch (error) {
      this.logger.error('Failed to initiate batch user sync', error.stack);
    }
  }
}
