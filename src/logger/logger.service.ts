import { Injectable } from '@nestjs/common';
import * as moment from 'moment-timezone';
import * as log from "npmlog";
import * as circularJSON from "circular-json";

@Injectable()
export class LoggerService {

  private serviceReference = process.env.SERVICE_REF;
  private nodeReference = process.env.NODE_REF;
  private environment = process.env.ENVIRONMENT;

  async customInfo(headers: Record<string, any>, message: Record<string, any>) {
    const dateFormat = moment().tz(process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss.SSS');
    const level = 'info';
    log.info(dateFormat, level, circularJSON.stringify(message), this.buildMessage(headers));
  }

  async customError(headers: Record<string, any>, message: Record<string, any>) {
    const dateFormat = moment().tz(process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss.SSS');
    const level = 'error';
    log.error(dateFormat, level, circularJSON.stringify(message), this.buildMessage(headers));
  }

  private buildMessage(headers: Record<string, any>): string {
    return `srvRef=${this.serviceReference} txEpd=0 txRef=${headers && headers['x-txref'] || null} cmRef=${headers && headers['x-cmref']
      || null} nodeRef=${this.nodeReference} rhsRef=${headers && headers['x-prref'] || null} chRef=${headers && headers['x-chref']
      || null} prRef=${headers && headers['x-prref'] || null} commerce=${headers && headers['x-commerce'] || null} country=${headers && headers['x-country']
      || null} usrTx=${headers && headers['x-usrtx'] || null} environment=${this.environment}`
  }

}