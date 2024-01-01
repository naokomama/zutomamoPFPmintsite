class RadioGroupItem {
  /**
   * @param text  表示名
   * @param value 内部の値
   * @param color 色
   */
  constructor (
    public text: string,
    public value: number | string | boolean,
    public color: string
  ){}
}

export default RadioGroupItem