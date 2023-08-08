import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  UnprocessableEntityException,
} from '@nestjs/common';
import { isNumber, isObject } from 'lodash';
import {
  FilterQuery,
  OrderWhereQuery,
} from 'src/repositories/firebase/firebase.type';

export class ParseJSONPipe {
  protected parseJSON(value: any, metadata: ArgumentMetadata) {
    let parsedValue = value;
    try {
      parsedValue = JSON.parse(value);
    } catch (err) {
      console.log(err, metadata);
      throw new UnprocessableEntityException('Invalid JSON provided');
    }
    return parsedValue;
  }
}

@Injectable()
export class ParseFilterPipe extends ParseJSONPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const parsedJSON = this.parseJSON(value, metadata) as FilterQuery;
    if (
      (parsedJSON.where && !isObject(parsedJSON.where)) ||
      (parsedJSON.order && !isObject(parsedJSON.order)) ||
      (parsedJSON.size && !isNumber(parsedJSON.size)) ||
      (parsedJSON.page && !isNumber(parsedJSON.page))
    )
      throw new UnprocessableEntityException('Invalid JSON provided');
    return parsedJSON;
  }
}

@Injectable()
export class ParseWherePipe extends ParseJSONPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const parsedJSON = this.parseJSON(value, metadata) as OrderWhereQuery;
    if (
      (parsedJSON.where && !isObject(parsedJSON.where)) ||
      (parsedJSON.order && !isObject(parsedJSON.order))
    )
      throw new UnprocessableEntityException('Invalid JSON provided');
    return parsedJSON;
  }
}
