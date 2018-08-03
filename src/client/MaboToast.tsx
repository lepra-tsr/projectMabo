'use strict';

import './handler.css';
import { Toaster, IToaster, Intent, IToastProps } from "@blueprintjs/core";

export class MaboToast {
  static toaster?:IToaster;
  static show(props: IToastProps) {
    if(!MaboToast.toaster){
      MaboToast.toaster = Toaster.create();
    }
    MaboToast.toaster.show(props);
  }

  static danger(msg: string) {
    const props: IToastProps = {
      intent: Intent.DANGER,
      message: msg
    };
    MaboToast.show(props);
  }

  static success(msg: string) {
    const props: IToastProps = {
      intent: Intent.SUCCESS,
      message: msg
    };
    MaboToast.show(props);
  }
}
