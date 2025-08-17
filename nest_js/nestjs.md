## NestJS 제대로 이해하기: Express, Hapi와 뭐가 다르고 왜 쓰는가

현업 기준으로 정리했다. 불필요한 미사여구 없이, 선택과 설계에 바로 쓰이도록 설명한다.

---

## 한 줄 요약

- **NestJS**: Node.js 서버 애플리케이션을 엔터프라이즈 수준 구조로 빠르게 만드는 프레임워크. 의존성 주입(DI), 모듈 시스템, 데코레이터 기반의 선언적 프로그래밍을 제공. 기본 런타임은 **Express**지만, **Fastify**로도 쉽게 전환 가능(어댑터).

---

## Express, Hapi, NestJS 비교

- **Express**
  - **강점**: 가볍고 자유롭다. 러닝커브 낮다. 생태계/자료가 압도적으로 많다.
  - **약점**: 큰 규모에서 구조가 쉽게 무너진다. DI/모듈 개념이 없어 규칙 없이는 유지보수 난이도↑.
  - **언제**: 소규모 API, 빠른 프로토타이핑, 프레임워크 오버헤드가 싫을 때.

- **Hapi**
  - **강점**: 보안/검증/플러그인에 강하다. 설정 중심(config-driven)이고 일관된 스타일을 강제.
  - **약점**: 러닝커브가 있고, 팀 내 합의가 없으면 생산성이 떨어질 수 있다. 생태계가 Express보다 좁다.
  - **언제**: 정책/보안/검증이 엄격하고, 프레임워크가 규칙을 강하게 잡아주길 원하는 엔터프라이즈.

- **NestJS**
  - **강점**: 아키텍처가 내장되어 있다(DI, 모듈, 레이어드, AOP 스타일의 파이프/가드/인터셉터). 타입스크립트 1급. 테스트/문서화/마이크로서비스/웹소켓/GraphQL 통합이 정돈되어 있다.
  - **약점**: 초반 러닝커브. 프레임워크를 이해하기 전까지는 "과해 보일" 수 있다.
  - **언제**: 중대형 서비스, 여러 팀이 협업, 장기 유지보수, 명확한 경계/규칙이 필요한 경우.

요약하면: Express는 최소 도구, Hapi는 강제된 규칙, Nest는 아키텍처 자체를 제공한다.

---

## NestJS의 핵심 개념 (실무에서 꼭 쓰는 것만)

- **모듈(Module)**: 기능 단위를 묶는 경계. `imports`, `providers`, `controllers`, `exports`로 의존성을 명시적으로 드러낸다.
- **의존성 주입(DI, Provider)**: 서비스/리포지토리를 주입받는다. 테스트 용이성↑, 교체 가능성↑.
- **컨트롤러(Controller)**: 라우팅과 HTTP 레벨 책임. 비즈니스 로직은 넣지 말고 서비스로 위임.
- **파이프(Pipe)**: 요청 DTO 변환/검증. `class-validator`와 `class-transformer`로 안전한 입력 경계.
- **가드(Guard)**: 인가/권한 체크. 토큰, 롤, 정책 결정은 여기서.
- **인터셉터(Interceptor)**: 로깅/캐싱/응답 매핑/성능 계측 등 횡단 관심사(AOP) 처리.
- **필터(Exception Filter)**: 예외 형식 표준화. 응답 규격을 한 곳에서 관리.
- **어댑터(Adapter)**: Express ↔ Fastify 전환. 고성능이 필요하면 Fastify 선택.
- **마이크로서비스/전송 레이어**: TCP, Redis, NATS, gRPC 등 메시징 패턴을 표준화.

---

## DI(의존성 주입) 제대로 이해하기

- **Provider 기본**: 클래스에 `@Injectable()`을 달고, 모듈의 `providers`에 등록하면 기본 싱글톤으로 관리된다.
- **토큰 기반 주입**: 인터페이스는 런타임에 사라지므로 주입 토큰을 사용한다(`string`/`symbol`/`abstract class`).

```ts
// tokens.ts
export const PRICE_REPOSITORY = Symbol('PRICE_REPOSITORY');

// price.module.ts
import { Module } from '@nestjs/common';
import { PRICE_REPOSITORY } from './tokens';

@Module({
  providers: [
    { provide: PRICE_REPOSITORY, useClass: MemoryPriceRepository },
    { provide: 'CONFIG', useValue: { ttlMs: 5000 } },
    {
      provide: CacheService,
      useFactory: (cfg: { ttlMs: number }) => new CacheService(cfg.ttlMs),
      inject: ['CONFIG'],
    },
  ],
  exports: [PRICE_REPOSITORY, CacheService],
})
export class PriceModule {}

// price.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { PRICE_REPOSITORY } from './tokens';

@Injectable()
export class PriceService {
  constructor(@Inject(PRICE_REPOSITORY) private readonly repo: PriceRepository) {}
}
```

- **커스텀 프로바이더**: `useClass`, `useValue`, `useFactory`로 구현을 유연하게 교체한다.
- **스코프와 라이프사이클**:
  - 기본은 프로세스 단일 인스턴스(싱글톤).
  - `REQUEST` 스코프: 요청마다 새 인스턴스(요청별 컨텍스트 보관용).
  - `TRANSIENT` 스코프: 주입 때마다 새 인스턴스(필요 최소화 권장).

```ts
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {}
```

- **라이프사이클 훅**: `OnModuleInit`, `OnModuleDestroy`, `OnApplicationShutdown` 등으로 초기화/정리 작업을 표준화한다.

```ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class Worker implements OnModuleInit, OnModuleDestroy {
  onModuleInit() {}
  onModuleDestroy() {}
}
```

- **순환 의존성 처리**: 먼저 설계를 재검토하고, 불가피할 때만 `forwardRef`나 지연 주입을 사용한다.

```ts
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AService {
  constructor(@Inject(forwardRef(() => BService)) private readonly b: BService) {}
}
```

---

## 모듈(Module) 제대로 쓰기

- **Feature/Shared 모듈 분리**: 도메인 기능 단위로 나누고, 재사용 대상은 `exports`로 공개한다.
- **Global 모듈**: 전역 필요 시에만 `@Global()` 사용. 남발하면 의존 경계가 흐려진다.

```ts
import { Global, Module } from '@nestjs/common';

@Global()
@Module({ providers: [ConfigService], exports: [ConfigService] })
export class ConfigModule {}
```

- **Dynamic Module 패턴**: `forRoot`/`forRootAsync`로 옵션에 따른 프로바이더 구성을 노출한다.

```ts
import { DynamicModule, Module } from '@nestjs/common';

export interface CacheModuleOptions { ttlMs: number }

@Module({})
export class CacheModule {
  static forRoot(options: CacheModuleOptions): DynamicModule {
    return {
      module: CacheModule,
      providers: [{ provide: 'CACHE_OPTIONS', useValue: options }, CacheService],
      exports: [CacheService],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => CacheModuleOptions | Promise<CacheModuleOptions>;
    inject?: any[];
  }): DynamicModule {
    return {
      module: CacheModule,
      providers: [
        { provide: 'CACHE_OPTIONS', useFactory: options.useFactory, inject: options.inject ?? [] },
        CacheService,
      ],
      exports: [CacheService],
    };
  }
}
```

- **모듈 간 순환 의존**: 정말 불가피한 경우에만 `forwardRef(() => OtherModule)`을 사용.

---

## Nest의 AOP 모델(Interceptors/Guards/Pipes/Filters)

Nest는 런타임에 메서드 호출 전후를 가로채는 체인을 제공한다. 전형적인 AOP의 `before/around/after/throw`에 대응한다.

- **Pipe(before)**: 입력 변환/검증.
- **Guard(before)**: 접근 제어. 통과 여부 결정.
- **Interceptor(around/after)**: 전후 처리, 응답 매핑, 캐싱, 트레이싱.
- **Exception Filter(throw)**: 예외를 표준 응답으로 변환.

```ts
// logging.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const startedAt = Date.now();
    return next.handle().pipe(
      tap(() => {
        const elapsedMs = Date.now() - startedAt;
      }),
    );
  }
}
```

```ts
// roles.guard.ts
import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', ctx.getHandler()) ?? [];
    if (roles.length === 0) return true;
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    return roles.some((r) => user?.roles?.includes(r));
  }
}
```

```ts
// http-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch(Error)
export class HttpExceptionMapper implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const res: any = host.switchToHttp().getResponse();
    res.status(500).json({ message: exception.message });
  }
}
```

```ts
// example.controller.ts (적용 예)
import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { Roles } from './roles.guard';

@Controller('admin')
@UseInterceptors(LoggingInterceptor)
@UseGuards(RolesGuard)
export class AdminController {
  @Get('secure')
  @Roles('admin')
  secureRoute() {
    return { ok: true };
  }
}
```

---

## Express/Hapi 개발자 관점에서 본 NestJS의 장점

- **구조의 일관성**: 컨트롤러/서비스/리포지토리/모듈로 표준화. 코드리뷰/온보딩 속도↑.
- **테스트 쉬움**: DI 덕분에 목 주입이 간단. 유스케이스/도메인 단위 테스트가 자연스럽다.
- **데코레이터 기반 선언형 코드**: 라우트/검증/메타데이터를 선언으로 작성 → 가독성↑.
- **전사 공통 기능을 AOP로**: 로깅, 인증, 트레이싱을 인터셉터/가드/필터로 모듈화.
- **생태계/CLI**: Swagger, Validation, Config, Caching 등 보일러플레이트를 크게 줄인다.
- **성능 선택권**: Express 기본 + 필요 시 Fastify로 스위치(대부분 코드 수정 거의 없음).

---

## 빠른 감 잡기: 3개 파일로 끝내는 기본 구조

아래는 컨트롤러/서비스/모듈의 최소 예시. (설명에 집중했으니 실 프로젝트에선 디렉토리 분리 권장)

```ts
// example.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExampleService {
  getHealth(): string {
    return 'OK';
  }
}
```

```ts
// example.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ExampleService } from './example.service';

@Controller('health')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get()
  check() {
    return { status: this.exampleService.getHealth() };
  }
}
```

```ts
// example.module.ts
import { Module } from '@nestjs/common';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';

@Module({
  controllers: [ExampleController],
  providers: [ExampleService],
})
export class ExampleModule {}
```

애플리케이션 모듈(`AppModule`)에 `ExampleModule`을 `imports`로 추가하면 바로 동작한다.

---

## 파이프/가드/인터셉터/필터: 어디에 무엇을 넣나

- **Pipe**: DTO 변환/검증. 컨트롤러 레벨의 입력 경계.
- **Guard**: 인증/인가. 요청을 처리할지 말지 결정.
- **Interceptor**: 로깅/트랜잭션/캐싱/응답 매핑/메트릭.
- **Exception Filter**: 에러를 표준 응답으로 변환.

짧은 예시:

```ts
// validation.pipe.ts
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimAndValidatePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      value = value.trim();
    }
    if (value === '') {
      throw new BadRequestException('값이 비어 있습니다.');
    }
    return value;
  }
}
```

---

## 성능과 선택: Express vs Fastify 어댑터

- 기본은 **Express**. 시작이 빠르고 디버깅이 익숙하다.
- TPS가 높거나 레이턴시가 중요한 서비스는 **Fastify 어댑터** 사용을 고려. 대부분 비즈니스 코드 수정 없이 전환 가능.
  - HTTP 레벨 미들웨어(Fastify 플러그인) 차이는 있으니, 커스텀 미들웨어/플러그인 사용 시 확인 필요.

---

## 아키텍처 팁 (팀으로 개발할 때 부딪히는 부분)

- **모듈 경계가 곧 팀 경계**: 모듈 간 public API(`exports`)만 노출. 내부 구현은 숨긴다.
- **컨트롤러는 얇게**: 인증/검증만 하고 서비스로 위임. 서비스는 유스케이스 단위로 분리.
- **도메인/인프라 분리**: 리포지토리 인터페이스를 도메인에 정의하고, 구현은 인프라 레이어로.
- **DTO 분리**: 요청/응답 DTO와 내부 도메인 모델을 섞지 않는다.
- **예외 정책을 표준화**: 필터로 에러 응답 규격 고정. 클라이언트와 계약 안정화.
- **교차 관심사는 AOP로**: 로깅, 트레이싱, 캐싱은 인터셉터/가드로 공통화.

---

## Express/Hapi에서 Nest로 넘어올 때 자주 하는 실수

- 컨트롤러에 로직을 다 넣는다 → 유지보수 지옥. 서비스/유스케이스로 분리.
- DI 스코프를 이해하지 못한다 → 요청 단위 상태는 `REQUEST` 스코프, 대부분은 `DEFAULT`로 충분.
- 순환 의존성(circular dependency) 방치 → 모듈/서비스 경계를 다시 자르고 `forwardRef`는 최후의 수단.
- 전역 파이프/가드 남발 → 모듈/라우트 단위로 필요한 범위에만 적용.
- Request 객체에 집착 → DTO/데코레이터를 활용해 명시적 파라미터를 받는다.

---

## 테스트/문서화/운영 포인트

- **테스트**: DI로 목 주입 쉬움. 유스케이스/서비스 단위 테스트 비중을 높이고, 컨트롤러는 최소.
- **Swagger**: `@nestjs/swagger`로 DTO 기반 자동 문서화. 운영팀/클라이언트 협업에 즉효.
- **설정 관리**: `@nestjs/config`로 환경 변수 스키마 검증(JOI)까지 걸어라.
- **관측성**: 인터셉터로 요청 ID, 시간, 에러 스택을 일관 로깅. 메트릭(프로메테우스) 후킹.

---

## 언제 굳이 Nest를 쓰지 말까?

- 단일 목적의 아주 작은 툴성 서버. 유지 기간이 짧고 팀 규모가 1~2명.
- 극단적으로 커스텀 런타임/프레임워크를 써야 하는 특수한 경우.

그 외 대부분의 팀/기간/규모에서는 Nest가 **총 개발비용(TCO)**를 낮춘다.

---

## 결론

Express는 빠르고 가볍다. Hapi는 강한 규칙과 보안이 장점이다. Nest는 아키텍처를 내장해 **중대형 서비스의 생산성과 유지보수성**을 동시에 잡는다. 이미 Express/Hapi에 능숙하다면, Nest의 DI/모듈/AOP 개념만 익히면 금방 속도가 붙는다. 장기 운영을 생각하면 Nest가 안전한 기본값이다.


