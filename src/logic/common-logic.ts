/**
 * 日本時間に変換
 * @param time 日時ミリ秒
 * @returns 日本時間ベースの日時ミリ秒
 */
export const convertToJst = (time: number): number => {
  return time + (new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000
}

/**
 * タームを取得
 * @param time 日時ミリ秒
 * @returns ターム
 */
export const getTerm = (time: number): number => {
  const date = new Date(convertToJst(time))
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return year * 10000 + month * 100 + day
}

/**
 * 月を取得
 * @param time 日時ミリ秒
 * @returns yyyyMMの数値
 */
export const getMonth = (time: number): number => {
  const date = new Date(convertToJst(time))
  if (date.getDate() < 28) {
    date.setMonth(date.getMonth() - 1)
  }
  return Number(formatDate(date.getTime(), 'yyyyMM'))
}

/**
 * タームから日付テキストに変換
 * @param term ターム
 * @returns テキスト
 */
export const termToText = (term: number): string => {
  const year = Math.floor(term / 10000)
  const month = Math.floor((term % 10000) / 100)
  const day = term % 100
  return `${year}.${month}.${day}`
}


const DAYS = ['日', '月', '火', '水', '木', '金', '土']
/**
 * 指定フォーマットに従って日時テキストを取得
 * @param time 日時ミリ秒
 * @param format フォーマット
 * @returns 日時テキスト
 */
export const formatDate = (time: number, format: string): string => {
  const date = new Date(convertToJst(time))
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = ('0' + date.getHours()).slice(-2)
  const minute = ('0' + date.getMinutes()).slice(-2)
  const second = ('0' + date.getSeconds()).slice(-2)
  const days = DAYS[date.getDay()]
  return format.replace(/yyyy/g, year.toString())
    .replace(/ddd/g, `(${days.toString()})`)
    .replace(/MM/g, month.toString())
    .replace(/dd/g, day.toString())
    .replace(/hh/g, hour.toString())
    .replace(/mm/g, minute.toString())
    .replace(/ss/g, second.toString())
}

/**
 * 時間テキストを取得
 * @param miliSeconds ミリ秒数
 * @returns 残りの時間テキスト
 */
export const getRemaintimeText = (miliSeconds: number | null): string => {
  if (miliSeconds === null) return ''
  const seconds = Math.floor(miliSeconds / 1000)
  const day = Math.floor(seconds / 86400)
  const hour = ('0' + Math.floor(seconds % 86400 / 3600)).slice(-2)
  const min = ('0' + Math.floor(seconds % 3600 / 60)).slice(-2)
  const sec = ('0' + seconds % 60).slice(-2)
  return (day === 0) ? `${hour}:${min}:${sec}` : `${day}日と${hour}:${min}:${sec}`
}

/**
 * 英語と数字で構成されたランダムな文字列を生成
 * @param {Number} length 文字列の長さ
 * @returns {String} ランダム文字列
 */

/**
 * 英語と数字で構成されたランダムな文字列を生成
 * @param length 文字列の長さ
 * @returns ランダム文字列
 */
export const getRandomText = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * チェーン名を取得
 * @param chainId チェーンID
 * @returns チェーン名
 */
export const getChainName = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return 'Ethereum'
    case 5:
      return 'Goerli'
    case 137:
      return 'Polygon'
    case 11155111:
      return 'Sepolia'
    default:
      return 'Unknown'
  }
}

/**
 * 規格名を取得
 * @param standard 規格
 * @returns 規格名
 */
export const getStandardName = (standard: string): string => {
  switch (standard) {
    case 'erc721':
      return 'ERC721'
    case 'erc1155':
      return 'ERC1155'
    default:
      return 'Unknown'
  }
}

/**
 * イーサスキャンURLを取得（アドレスver）
 * @param chainId         チェーンID
 * @param contractAddress コントラクトアドレス
 * @returns
 */
export const getEtherscanAddressUrl = (chainId: number, contractAddress: string): string => {
  switch (chainId) {
    case 1: {
      return `https://etherscan.io/address/${contractAddress}#code`
    }
    case 5: {
      return `https://goerli.etherscan.io/address/${contractAddress}#code`
    }
    case 137: {
      return `https://polygonscan.com/address/${contractAddress}#code`
    }
    case 11155111: {
      return `https://sepolia.etherscan.io/address/${contractAddress}#code`
    }
  }
  return ''
}


/**
 * イーサスキャンURLを取得（トランザクションver）
 * @param chainId         チェーンID
 * @param contractAddress コントラクトアドレス
 * @returns
 */
export const getEtherscanTransactionUrl = (chainId: number, contractAddress: string): string => {
  switch (chainId) {
    case 1: {
      return `https://etherscan.io/tx/${contractAddress}#code`
    }
    case 5: {
      return `https://goerli.etherscan.io/tx/${contractAddress}#code`
    }
    case 137: {
      return `https://polygonscan.com/tx/${contractAddress}#code`
    }
    case 11155111: {
      return `https://sepolia.etherscan.io/tx/${contractAddress}#code`
    }
  }
  return ''
}