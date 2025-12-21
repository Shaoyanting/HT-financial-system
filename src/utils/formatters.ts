/**
 * 格式化货币金额
 * @param value 金额数值
 * @param currency 货币符号，默认为¥
 * @param decimals 小数位数，默认为2
 * @returns 格式化后的货币字符串
 */
export const formatCurrency = (value: number, currency: string = '¥', decimals: number = 2): string => {
  if (isNaN(value)) return `${currency}0.00`
  
  const formattedValue = Math.abs(value).toFixed(decimals)
  const sign = value < 0 ? '-' : ''
  
  // 添加千位分隔符
  const parts = formattedValue.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  return `${sign}${currency}${parts.join('.')}`
}

/**
 * 格式化百分比
 * @param value 百分比数值（如0.15表示15%）
 * @param decimals 小数位数，默认为2
 * @param showSign 是否显示正负号，默认为true
 * @returns 格式化后的百分比字符串
 */
export const formatPercent = (value: number, decimals: number = 2, showSign: boolean = true): string => {
  if (isNaN(value)) return '0.00%'
  
  const sign = showSign && value > 0 ? '+' : ''
  const formattedValue = (value * 100).toFixed(decimals)
  
  return `${sign}${formattedValue}%`
}

/**
 * 格式化数字为缩写形式（如1.5K, 2.3M）
 * @param value 数值
 * @param decimals 小数位数，默认为1
 * @returns 格式化后的缩写字符串
 */
export const formatAbbreviation = (value: number, decimals: number = 1): string => {
  if (isNaN(value)) return '0'
  
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  
  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(decimals)}B`
  } else if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(decimals)}M`
  } else if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(decimals)}K`
  } else {
    return `${sign}${absValue.toFixed(decimals)}`
  }
}

/**
 * 格式化日期
 * @param date 日期字符串或Date对象
 * @param format 格式字符串，默认为'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(d.getTime())) return 'Invalid Date'
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 根据涨跌幅获取颜色类名
 * @param changePercent 涨跌幅百分比
 * @returns CSS类名
 */
export const getChangeColorClass = (changePercent: number): string => {
  if (changePercent > 0) return 'text-success'
  if (changePercent < 0) return 'text-danger'
  return ''
}

/**
 * 根据数值获取颜色（用于图表）
 * @param value 数值
 * @param min 最小值
 * @param max 最大值
 * @returns HSL颜色字符串
 */
export const getValueColor = (value: number, min: number, max: number): string => {
  const normalized = (value - min) / (max - min)
  const hue = normalized * 120 // 0=红色，120=绿色
  return `hsl(${hue}, 70%, 50%)`
}

/**
 * 防抖函数
 * @param func 要执行的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 * @param func 要执行的函数
 * @param limit 限制时间（毫秒）
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 深拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as T
  if (typeof obj === 'object') {
    const clonedObj = {} as { [key: string]: unknown }
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone((obj as Record<string, unknown>)[key])
      }
    }
    return clonedObj as T
  }
  return obj
}

/**
 * 生成随机颜色
 * @returns 随机颜色十六进制字符串
 */
export const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

export default {
  formatCurrency,
  formatPercent,
  formatAbbreviation,
  formatDate,
  getChangeColorClass,
  getValueColor,
  debounce,
  throttle,
  deepClone,
  generateRandomColor,
}
