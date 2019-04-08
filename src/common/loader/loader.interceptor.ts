import { ExecutionContext, Injectable, NestInterceptor, Type } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { Observable } from 'rxjs';

import { ILoader } from './loader.interface';

@Injectable()
export class LoaderInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector, private readonly moduleRef: ModuleRef) {}

  // tslint:disable: no-unsafe-any
  // tslint:disable-next-line: no-any
  public intercept(context: ExecutionContext, call$: Observable<any>) {
    const type = this.reflector.get<Type<ILoader>>('dataloader', context.getHandler());

    if (type) {
      const gqlExecutionContext = GqlExecutionContext.create(context);
      const ctx = gqlExecutionContext.getContext();

      if (!ctx[type.name]) {
        ctx[type.name] = this.moduleRef.get<ILoader>(type, { strict: false }).generateDataLoader();
      }
    }

    return call$;
  }
}