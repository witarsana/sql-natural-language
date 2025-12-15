import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { createCustomElement } from "@angular/elements";
import { ApplicationRef } from "@angular/core";
import { AppComponent } from "./app/app.component";
import { AppModule } from "./app/app.module";
import { ChloeAssistComponent } from "./app/chloe-assist/chloe-assist.component";

const isWebComponent = !document.querySelector("app-root");

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then((moduleRef) => {
    const injector = moduleRef.injector;

    // 1️⃣ Register Web Component
    const element = createCustomElement(ChloeAssistComponent, {
      injector: injector,
    });

    if (!customElements.get("cl-chloe-assist")) {
      customElements.define("cl-chloe-assist", element);
    }

    // 2️⃣ Bootstrap AppComponent only if <app-root> exists (Development / Preview)
    if (!isWebComponent) {
      const appRef = injector.get(ApplicationRef);
      appRef.bootstrap(AppComponent);
    }
  })
  .catch((err) => console.error(err));
