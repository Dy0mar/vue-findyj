/**
 * YOU ARE GOING TO BREAK VUE IF YOU DEFINE OBJECT PROTOTYPES
 */

import { substring } from "src/utils/text";

String.prototype.format = function (this: string, fmt: object) {
  return substring(this, fmt);
};

Number.prototype.kFormat = function (this: number) {
  if (this < 1000 && this > -1000) {
    return this.toString();
  } else if (this < 1000000 && this > -1000000) {
    return `${Math.floor(this / 1000)}k`;
  }
  return `${Math.floor(this / 1000000)}M`;
};
