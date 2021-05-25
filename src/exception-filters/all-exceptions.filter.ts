import { Catch, ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { LoggerService } from './../logger/logger.service';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {

  private environment = process.env.ENVIRONMENT;
  private logger = new LoggerService();

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const error: Record<string, any> = (exception instanceof HttpException) ? exception.getResponse() : (exception.message) ? exception.message : exception;
    this.logger.customError(request.headers, error);

    const status = exception.status
      || (exception.response) ? exception.response.status
      || exception.response.statusCode : HttpStatus.INTERNAL_SERVER_ERROR;
    let statusDescription = '';
    let url = '';
    if (this.environment === 'production') {
      return response.status(status)
        .json({
          status,
          statusDescription,
        });
    };
    statusDescription = JSON.stringify(error);
    url = request.url;

    return response.status(status)
      .json({
        status,
        statusDescription,
        url,
      });
  }
}