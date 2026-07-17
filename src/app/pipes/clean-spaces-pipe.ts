import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cleanSpaces',
})
export class CleanSpacesPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.replace(/&nbsp;/g, ' ');
  }
}
