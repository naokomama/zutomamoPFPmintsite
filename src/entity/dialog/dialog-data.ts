class DialogData {
  /**
   * @param title          タイトル
   * @param message        本文
   * @param callback       コールバック
   * @param cancelCallback キャンセル時コールバック
   */
  constructor (
    public title: string = '',
    public message: string = '',
    public callback: () => void = () => {},
    public cancelCallback: () => void = () => {}
  ){}
}

export default DialogData