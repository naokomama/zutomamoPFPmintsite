class ResponseBase {
  /**
   * @param succeeded 成功したかどうか
   * @param message   メッセージ
   */
  constructor(
    public succeeded: boolean = true,
    public message: string | null = null
  ){}
}

export default ResponseBase