import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: 'input',
})
export class InputScrollToViewOnFocus {
  @HostListener('window:focusin', [ '$event' ])
  onFocus(event: FocusEvent) {
    const element = event.target as HTMLElement;
    // console.log('InputScrollToViewOnFocus: onFocus', element);
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      setTimeout(() => {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }, 300);
    }
  }
}
