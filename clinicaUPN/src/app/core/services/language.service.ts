import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Lang = 'es' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'clinica_lang';
  private langSubject = new BehaviorSubject<Lang>(this.getStoredLang());

  lang$: Observable<Lang> = this.langSubject.asObservable();

  get currentLang(): Lang {
    return this.langSubject.value;
  }

  setLang(lang: Lang): void {
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.langSubject.next(lang);
  }

  private getStoredLang(): Lang {
    return (localStorage.getItem(this.STORAGE_KEY) as Lang) || 'es';
  }
}
