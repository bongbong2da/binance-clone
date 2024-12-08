import { atom } from "recoil";

export const standardCurrencyAtom = atom({
  key: "StandardCurrency",
  default: "USDT",
});
