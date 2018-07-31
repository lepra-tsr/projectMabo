'use strict';

import './handler.css';
import { Toaster, IToaster, Intent, IToastProps } from "@blueprintjs/core";

export class MaboToast {
  static show(props: IToastProps) {
    const iToaster: IToaster = Toaster.create();
    iToaster.show(props);
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
