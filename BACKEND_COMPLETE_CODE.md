# 🔧 BACKEND TO'LIQ CODE (NestJS + Prisma + PostgreSQL)

## 📁 FOLDER STRUCTURE

```
task-planner-backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   └── jwt-auth.guard.ts
│   ├── tasks/
│   │   ├── tasks.controller.ts
│   │   ├── tasks.service.ts
│   │   └── tasks.module.ts
│   ├── categories/
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── categories.module.ts
│   ├── statistics/
│   │   ├── statistics.controller.ts
│   │   ├── statistics.service.ts
│   │   └── statistics.module.ts
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma
├── .env
├── package.json
└── tsconfig.json
```

---

## 🗄️ PRISMA SCHEMA

**File: `prisma/schema.prisma`**

\`\`\`prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]
  categories Category[]
}

model Task {
  id          String   @id @default(uuid())
  title       String
  description String
  category    String
  priority    String
  type        String
  date        DateTime
  completed   Boolean  @default(false)
  archived    Boolean  @default(false)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([date])
}

model Category {
  id        String   @id @default(uuid())
  name      String
  emoji     String
  color     String
  taskCount Int      @default(0)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
\`\`\`

---

## 🔐 PRISMA SERVICE

**File: `src/prisma/prisma.service.ts`**

\`\`\`typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
\`\`\`

**File: `src/prisma/prisma.module.ts`**

\`\`\`typescript
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
\`\`\`

---

## 🔑 AUTH MODULE

**File: `src/auth/jwt.strategy.ts`**

\`\`\`typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId, email: payload.email };
  }
}
\`\`\`

**File: `src/auth/jwt-auth.guard.ts`**

\`\`\`typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
\`\`\`

**File: `src/auth/auth.service.ts`**

\`\`\`typescript
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(email: string, password: string, name?: string) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email allaqachon ro\'yxatdan o\'tgan');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Generate JWT token
    const token = this.jwtService.sign({ 
      userId: user.id, 
      email: user.email 
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
    }

    // Generate JWT token
    const token = this.jwtService.sign({ 
      userId: user.id, 
      email: user.email 
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return user;
  }
}
\`\`\`

**File: `src/auth/auth.controller.ts`**

\`\`\`typescript
import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() body: { email: string; password: string; name?: string },
  ) {
    return this.authService.signup(body.email, body.password, body.name);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.authService.validateUser(req.user.userId);
  }
}
\`\`\`

**File: `src/auth/auth.module.ts`**

\`\`\`typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
\`\`\`

---

## 📝 TASKS MODULE

**File: `src/tasks/tasks.service.ts`**

\`\`\`typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Vazifa topilmadi');
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('Sizga ruxsat yo\'q');
    }

    return task;
  }

  async create(data: any) {
    return this.prisma.task.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });
  }

  async update(id: string, data: any, userId: string) {
    await this.findOne(id, userId);

    const updateData = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    return this.prisma.task.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.task.delete({
      where: { id },
    });
  }

  async toggleComplete(id: string, userId: string) {
    const task = await this.findOne(id, userId);
    return this.prisma.task.update({
      where: { id },
      data: { completed: !task.completed },
    });
  }

  async toggleArchive(id: string, userId: string) {
    const task = await this.findOne(id, userId);
    return this.prisma.task.update({
      where: { id },
      data: { archived: !task.archived },
    });
  }
}
\`\`\`

**File: `src/tasks/tasks.controller.ts`**

\`\`\`typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async getAllTasks(@Request() req) {
    return this.tasksService.findAll(req.user.userId);
  }

  @Get(':id')
  async getTask(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.userId);
  }

  @Post()
  async createTask(@Body() data: any, @Request() req) {
    return this.tasksService.create({
      ...data,
      userId: req.user.userId,
    });
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req,
  ) {
    return this.tasksService.update(id, data, req.user.userId);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string, @Request() req) {
    await this.tasksService.delete(id, req.user.userId);
    return { message: 'Vazifa o\'chirildi' };
  }

  @Patch(':id/complete')
  async toggleComplete(@Param('id') id: string, @Request() req) {
    return this.tasksService.toggleComplete(id, req.user.userId);
  }

  @Patch(':id/archive')
  async toggleArchive(@Param('id') id: string, @Request() req) {
    return this.tasksService.toggleArchive(id, req.user.userId);
  }
}
\`\`\`

**File: `src/tasks/tasks.module.ts`**

\`\`\`typescript
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
\`\`\`

---

## 🏷️ CATEGORIES MODULE

**File: `src/categories/categories.service.ts`**

\`\`\`typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Kategoriya topilmadi');
    }

    if (category.userId !== userId) {
      throw new ForbiddenException('Sizga ruxsat yo\'q');
    }

    return category;
  }

  async create(data: any) {
    return this.prisma.category.create({
      data,
    });
  }

  async update(id: string, data: any, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
\`\`\`

**File: `src/categories/categories.controller.ts`**

\`\`\`typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async getAllCategories(@Request() req) {
    return this.categoriesService.findAll(req.user.userId);
  }

  @Get(':id')
  async getCategory(@Param('id') id: string, @Request() req) {
    return this.categoriesService.findOne(id, req.user.userId);
  }

  @Post()
  async createCategory(@Body() data: any, @Request() req) {
    return this.categoriesService.create({
      ...data,
      userId: req.user.userId,
    });
  }

  @Put(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req,
  ) {
    return this.categoriesService.update(id, data, req.user.userId);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string, @Request() req) {
    await this.categoriesService.delete(id, req.user.userId);
    return { message: 'Kategoriya o\'chirildi' };
  }
}
\`\`\`

**File: `src/categories/categories.module.ts`**

\`\`\`typescript
import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
\`\`\`

---

## 📊 STATISTICS MODULE

**File: `src/statistics/statistics.service.ts`**

\`\`\`typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getStatistics(userId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { userId },
    });

    const categories = await this.prisma.category.findMany({
      where: { userId },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const activeTasks = tasks.filter((t) => !t.completed && !t.archived).length;
    const archivedTasks = tasks.filter((t) => t.archived).length;

    const highPriority = tasks.filter(
      (t) => t.priority === 'high' && !t.completed,
    ).length;
    const mediumPriority = tasks.filter(
      (t) => t.priority === 'medium' && !t.completed,
    ).length;
    const lowPriority = tasks.filter(
      (t) => t.priority === 'low' && !t.completed,
    ).length;

    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      activeTasks,
      archivedTasks,
      highPriority,
      mediumPriority,
      lowPriority,
      completionRate: Math.round(completionRate * 10) / 10,
      categories: categories.length,
    };
  }
}
\`\`\`

**File: `src/statistics/statistics.controller.ts`**

\`\`\`typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get()
  async getStatistics(@Request() req) {
    return this.statisticsService.getStatistics(req.user.userId);
  }
}
\`\`\`

**File: `src/statistics/statistics.module.ts`**

\`\`\`typescript
import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
\`\`\`

---

## 🏗️ APP MODULE

**File: `src/app.module.ts`**

\`\`\`typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { CategoriesModule } from './categories/categories.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    TasksModule,
    CategoriesModule,
    StatisticsModule,
  ],
})
export class AppModule {}
\`\`\`

---

## 🚀 MAIN.TS

**File: `src/main.ts`**

\`\`\`typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(\`🚀 Backend server running on http://localhost:\${port}/api\`);
}
bootstrap();
\`\`\`

---

## 📦 PACKAGE.JSON

**File: `package.json`**

\`\`\`json
{
  "name": "task-planner-backend",
  "version": "1.0.0",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "bcrypt": "^5.1.1",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/passport-jwt": "^3.0.9",
    "prisma": "^5.0.0",
    "typescript": "^5.1.3"
  }
}
\`\`\`

---

## 🌍 ENVIRONMENT VARIABLES

**File: `.env`**

\`\`\`env
# Database
DATABASE_URL="postgresql://user:password@host:5432/task_planner"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3000

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
\`\`\`

---

**✅ TAYYOR! Backend to'liq kodlar. Copy-paste qiling va ishlataveringiz!** 🎉
