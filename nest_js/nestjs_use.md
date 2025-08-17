## NestJS 사용법 실전 가이드: 명령어, 데코레이터, 부트스트랩 패턴

불필요한 수사는 뺐다. 바로 복붙해서 쓰고, 팀 규칙에 녹일 수 있게 정리한다. (동일 디렉토리의 `nestjs.md`, `nestjs_test.md`와 내용이 겹치지 않도록 “사용/명령어/데코레이터/적용법” 위주로만 다룬다.)

---

## 1) 설치와 초기화

- Nest CLI 설치

```bash
npm i -g @nestjs/cli
```

- 새 프로젝트 생성(스캐폴딩)

```bash
nest new my-app
# 또는 Fastify 어댑터 선호 시 (생성 후 교체 권장)
```

- 기존 프로젝트(모노레포/커스텀)에도 CLI만 있으면 `nest g`로 코드 생성 가능

---

## 2) 자주 쓰는 CLI 명령어 (암기각)

- 실행/빌드

```bash
nest start            # 개발 서버 1회 실행
nest start --watch    # 변경 감지
nest build            # dist 빌드
nest build --watch
nest info             # 버전/환경 정보
nest update           # 의존성 스키매틱 업데이트
```

- 코드 생성 (schematics)

```bash
# 모듈/컨트롤러/서비스/프로바이더
nest g module users
nest g controller users --flat
nest g service users
nest g provider cache

# 인프라/코어 단위 구성 요소
nest g guard auth/roles
nest g pipe validation/trim
nest g interceptor logging
nest g filter http-exception
nest g middleware request-logger

# CRUD 리소스 한 번에
nest g resource users --crud        # DTO/Controller/Service/Module 일괄 생성
nest g resource orders --no-spec    # 스펙 파일 제외

# 실시간/GraphQL
nest g gateway ws/price             # WebSocket 게이트웨이
nest g resolver users               # GraphQL resolver
```

팁
- `nest g xxx path/name`처럼 하위 경로로 생성하면 폴더가 자동 정리된다.
- `--flat`은 폴더 생성을 생략하고 파일만 만든다.
- `--no-spec`으로 테스트 스텁 생성을 건너뛸 수 있다(테스트 전략은 별도 문서 참고).

---

## 3) 부트스트랩 패턴(앱 전체 정책은 여기서 끝낸다)

전역 파이프/가드/인터셉터/필터, CORS, 버저닝, 프리픽스 등은 `main.ts`에서 한 번에 걸러낸다.

```ts
// main.ts 예시 스니펫
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI }); // /v1, /v2

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,          // DTO에 정의된 속성만 통과
    forbidNonWhitelisted: true,
    transform: true,          // Primitive 변환(Query->number 등)
    transformOptions: { enableImplicitConversion: true },
  }));

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
```

부가 패턴
- Fastify 전환: `@nestjs/platform-fastify` 설치 후 `NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())`
- 종료 훅: `app.enableShutdownHooks()`로 SIGTERM 대응(쿠버네티스 등)
- 보안/압축: `helmet`, `compression` 미들웨어를 `app.use()`로 연결

---

## 4) 컨트롤러/라우팅 데코레이터 일람과 요령

- 라우팅

```ts
import { Controller, Get, Post, Put, Patch, Delete, All } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get() findAll() {}
  @Get(':id') findOne() {}
  @Post() create() {}
  @Put(':id') replace() {}
  @Patch(':id') update() {}
  @Delete(':id') remove() {}
  @All('health') health() {}
}
```

- 파라미터 추출

```ts
import { Param, Query, Body, Headers, Ip, Session, Req, Res, HttpCode, Header, Redirect } from '@nestjs/common';

@Get(':id')
@HttpCode(200)
@Header('X-Trace-Id', '...')
getUser(
  @Param('id') id: string,
  @Query('expand') expand?: string,
  @Headers('user-agent') ua?: string,
) { /* ... */ }

@Get('go')
@Redirect('https://example.com', 302)
go() {}
```

- 파일 업로드(멀터)

```ts
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Post('upload')
@UseInterceptors(FileInterceptor('file'))
upload(@UploadedFile() file: Express.Multer.File) { /* ... */ }
```

---

## 5) DTO와 검증 데코레이터(실무 최소 세트)

`class-validator`, `class-transformer` 조합으로 입력 경계를 튼튼히 한다.

```ts
import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsNumber()
  age: number;

  @IsOptional()
  @IsBoolean()
  marketing?: boolean;
}

export class BulkCreateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  users: CreateUserDto[];
}
```

컨트롤러에서 `ValidationPipe`가 전역으로 켜져 있으면 DTO 타입만 지정해주면 된다.

```ts
@Post()
create(@Body() dto: CreateUserDto) { /* ... */ }
```

---

## 6) Swagger 데코레이터(문서 품질은 계약 품질이다)

문서 스캐폴드만으로는 부족하다. DTO/엔드포인트에 메타를 채워넣자.

```ts
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody, ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'u_123', description: '사용자 ID' })
  id: string;

  @ApiProperty({ example: 'Lee' })
  name: string;
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get(':id')
  @ApiOperation({ summary: '단일 사용자 조회' })
  @ApiParam({ name: 'id', example: 'u_123' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  findOne(@Param('id') id: string) { /* ... */ }

  @Post()
  @ApiOperation({ summary: '사용자 생성' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, type: UserResponseDto })
  create(@Body() dto: CreateUserDto) { /* ... */ }
}
```

---

## 7) 적용법 요약: 미들웨어/가드/인터셉터/필터

- 미들웨어(라우터 이전, Express/Fastify 레벨)

```ts
// app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

@Module({ /* ... */ })
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
```

- 가드/인터셉터/필터 전역 적용

```ts
// main.ts 스니펫
app.useGlobalGuards(new RolesGuard(reflector));
app.useGlobalInterceptors(new LoggingInterceptor());
app.useGlobalFilters(new HttpExceptionMapper());
```

- 라우트/컨트롤러 단위 적용

```ts
import { UseGuards, UseInterceptors } from '@nestjs/common';

@UseGuards(RolesGuard)
@UseInterceptors(LoggingInterceptor)
@Controller('admin')
export class AdminController {}
```

---

## 8) 구성(Config)과 환경 변수

런타임 설정은 코드 밖으로. 옵션은 DI로 넣고, 스키마로 검증한다.

```ts
// config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string().valid('development', 'test', 'production').required(),
      }),
    }),
  ],
})
export class AppConfigModule {}
```

```ts
// 사용 예
import { ConfigService } from '@nestjs/config';

constructor(private readonly config: ConfigService) {}
const port = this.config.get<number>('PORT');
```

---

## 9) 커스텀 파라미터 데코레이터(요청 컨텍스트 추상화)

`createParamDecorator`로 반복되는 Request 접근을 숨긴다.

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.user?.id;
});

// 사용
@Get('me')
me(@UserId() userId: string) { /* ... */ }
```

---

## 10) 마이크로서비스/TCP 간단 사용(요청-응답 vs 발행-구독)

전송은 TCP/Redis/NATS/gRPC 중 택1. 아래는 TCP 예시.

```ts
// client.module.ts
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      { name: 'PRICE_CLIENT', transport: Transport.TCP, options: { host: '127.0.0.1', port: 8877 } },
    ]),
  ],
})
export class ClientModule {}
```

```ts
// 사용 예 (emit: fire-and-forget, send: request-response)
constructor(@Inject('PRICE_CLIENT') private readonly client: ClientProxy) {}

this.client.emit('price.updated', payload);
const resp = await firstValueFrom(this.client.send('price.query', { symbol: 'BTCUSDT' }));
```

```ts
// 서버 측 (handler)
@Controller()
export class PriceMsController {
  @MessagePattern('price.query')
  getPrice(data: any) { /* ... */ }
}
```

---

## 11) 배포/실행 스크립트 실전 팁

- 개발: `nest start --watch` 또는 `npm run start:dev`
- 프로덕션: `npm run build` 후 `node dist/main.js`
- PM2 예시

```bash
pm2 start dist/main.js --name my-app -i max
pm2 save && pm2 startup
```

- 환경 분기: `NODE_ENV=production`에서 로거 레벨/캐시/옵션을 좁힌다.

---

## 12) 자주 묻는 사용 팁

- 의존성이 선택적일 때: `@Optional()`을 주입 생성자 인자에 추가
- 순환 참조는 설계로 푸는 게 정석. 불가피하면 `forwardRef(() => XService)`로 지연 주입
- 라우트 중복 방지: `@Controller('v1/users')` + `app.enableVersioning` 병행 금지(한쪽만)
- 공통 에러 응답은 필터로 강제하고, 컨트롤러에서는 `HttpException` 파생 클래스를 던진다

---

필요한 건 여기 다 있다. 생성은 CLI로, 정책은 `main.ts`로, 계약은 DTO/Swagger로 정리하라. 팀이 합의한 규칙만 지키면 Nest는 유지보수 비용을 계속 낮춰준다.


---

## 13) WebSocket 게이트웨이 핵심 데코레이터

```ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/price', cors: { origin: '*' } })
export class PriceGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('join')
  onJoin(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    client.join(room);
    return { ok: true };
  }

  @SubscribeMessage('tick')
  onTick(@MessageBody() payload: { symbol: string; price: number }) {
    if (!payload?.symbol) throw new WsException('symbol required');
    this.server.to(payload.symbol).emit('price', payload);
  }
}
```

메모
- 기본 어댑터는 Socket.IO. `@nestjs/platform-ws`로 ws 전환 가능
- 인증은 커스텀 어댑터 또는 가드(`CanActivate` + `WsException`)로 처리

---

## 14) 빌트인 파이프(빠르게 쓰는 변환/검증)

```ts
import { ParseIntPipe, ParseBoolPipe, ParseUUIDPipe, DefaultValuePipe, ParseArrayPipe, ParseEnumPipe } from '@nestjs/common';

@Get(':id')
get(@Param('id', ParseIntPipe) id: number) {}

@Get()
list(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('active', new DefaultValuePipe(false), ParseBoolPipe) active: boolean,
  @Query('ids', new ParseArrayPipe({ items: String, separator: ',' })) ids: string[],
) {}

enum Sort { asc='asc', desc='desc' }
@Get('sort')
sorted(@Query('order', new ParseEnumPipe(Sort)) order: Sort) {}

@Get('uuid/:id')
uuid(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {}
```

---

## 15) 캐시/응답 직렬화(전역 적용 패턴)

- 캐시(CacheModule + CacheInterceptor)

```ts
// app.module.ts
import { CacheModule } from '@nestjs/cache-manager';

@Module({ imports: [CacheModule.register({ ttl: 5_000 })] })
export class AppModule {}

// main.ts
app.useGlobalInterceptors(new CacheInterceptor(app.get(Reflector)));

// 라우트 단위
@UseInterceptors(CacheInterceptor)
@CacheKey('users:list')
@CacheTTL(10)
@Get('users')
list() {}
```

- 응답 직렬화(ClassSerializerInterceptor)

```ts
import { Exclude, Expose } from 'class-transformer';

export class UserModel {
  @Expose() id: string;
  @Expose() name: string;
  @Exclude() passwordHash: string;
}

// main.ts
app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

// 컨트롤러에서 반환만 하면 직렬화 규칙이 적용됨
```

---

## 16) 실행 순서(요청 라이프사이클) 한 눈에

- 미들웨어 → 가드 → 인터셉터(before) → 파이프 → 컨트롤러 핸들러 → 인터셉터(after) → 예외 필터(throw)
- 전역 > 컨트롤러 > 메서드 순서로 좁혀 적용됨(가까운 범위가 우선)

---

## 17) 스케줄러(배치/주기 작업)

```bash
npm i @nestjs/schedule
```

```ts
// app.module.ts
import { ScheduleModule } from '@nestjs/schedule';
@Module({ imports: [ScheduleModule.forRoot()] })
export class AppModule {}

// any.service.ts
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';

@Injectable()
export class JobsService {
  @Cron(CronExpression.EVERY_MINUTE)
  aggregate() {}

  @Interval(5_000)
  heartbeat() {}

  @Timeout(10_000)
  warmup() {}
}
```

---

## 18) 스로틀링(요청 제한)

```bash
npm i @nestjs/throttler
```

```ts
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }])],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}

// 라우트 단위
@Throttle(10, 60)
@Get('search')
search() {}
```

---

## 19) 버저닝 심화(URI/헤더/미디어타입/커스텀)

```ts
app.enableVersioning({ type: VersioningType.URI });          // /v1
app.enableVersioning({ type: VersioningType.HEADER, header: 'X-API-Version' });
app.enableVersioning({ type: VersioningType.MEDIA_TYPE, key: 'v=' }); // Accept: application/json; v=1

// 커스텀 추출기
app.enableVersioning({
  type: VersioningType.CUSTOM,
  extractor: (req: Request) => req.headers['x-ver'] as string,
});

@Controller({ path: 'users', version: '1' })
export class UsersV1 {}
```

---

## 20) CLI 생성 옵션(자주 쓰는 고급 플래그)

```bash
nest g service orders --flat --no-spec           # 파일만, spec 제외
nest g controller admin/users --path src/admin   # 생성 경로 지정
nest g module auth --project api                 # 모노레포 서브 프로젝트
nest g resource products --crud --dry-run        # 생성 미리보기
```

