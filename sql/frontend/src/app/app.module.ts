import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { AppComponent } from "./app.component";
import { ChatComponent } from "./components/chat/chat.component";
import { MessageComponent } from "./components/message/message.component";
import { TableResultComponent } from "./components/table-result/table-result.component";
import { RoleSelectorComponent } from "./components/role-selector/role-selector.component";

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    MessageComponent,
    TableResultComponent,
    RoleSelectorComponent,
  ],
  imports: [BrowserModule, FormsModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
