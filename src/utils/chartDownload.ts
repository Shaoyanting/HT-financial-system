/**
 * 图表下载工具
 * 用于将Recharts图表导出为PNG图片
 */

/**
 * 下载图表为PNG图片
 * @param chartId 图表容器的ID
 * @param fileName 下载的文件名（不包含扩展名）
 */
export const downloadChartAsPNG = (chartId: string, fileName: string): void => {
  const chartElement = document.getElementById(chartId);
  
  if (!chartElement) {
    console.error(`找不到图表元素: ${chartId}`);
    return;
  }

  // 创建canvas元素
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('无法创建canvas上下文');
    return;
  }

  // 设置canvas尺寸为图表尺寸
  const { width, height } = chartElement.getBoundingClientRect();
  canvas.width = width;
  canvas.height = height;

  // 设置背景色
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 获取SVG元素
  const svgElement = chartElement.querySelector('svg');
  if (!svgElement) {
    console.error('找不到SVG元素');
    return;
  }

  // 克隆SVG以避免修改原始元素
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  
  // 设置SVG样式以确保正确渲染
  clonedSvg.setAttribute('width', width.toString());
  clonedSvg.setAttribute('height', height.toString());
  clonedSvg.style.backgroundColor = '#ffffff';

  // 将SVG转换为数据URL
  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  // 创建图片元素
  const img = new Image();
  
  img.onload = () => {
    try {
      // 绘制图片到canvas
      ctx.drawImage(img, 0, 0, width, height);
      
      // 将canvas转换为PNG数据URL
      const pngUrl = canvas.toDataURL('image/png');
      
      // 创建下载链接
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${fileName}_${new Date().getTime()}.png`;
      
      // 触发下载
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // 清理URL
      URL.revokeObjectURL(svgUrl);
    } catch (error) {
      console.error('图表下载失败:', error);
    }
  };

  img.onerror = (error) => {
    console.error('图片加载失败:', error);
    URL.revokeObjectURL(svgUrl);
  };

  img.src = svgUrl;
};

/**
 * 简单的图表下载方法（使用html2canvas）
 * 如果html2canvas可用，使用更可靠的方法
 */
export const downloadChartWithHtml2Canvas = async (chartId: string, fileName: string): Promise<void> => {
  try {
    // 动态导入html2canvas
    const html2canvas = await import('html2canvas');
    const chartElement = document.getElementById(chartId);
    
    if (!chartElement) {
      console.error(`找不到图表元素: ${chartId}`);
      return;
    }

    // 使用html2canvas将元素转换为canvas
    const canvas = await html2canvas.default(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2, // 提高分辨率
      useCORS: true,
      logging: false,
    });

    // 转换为PNG数据URL
    const pngUrl = canvas.toDataURL('image/png');
    
    // 创建下载链接
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${fileName}_${new Date().getTime()}.png`;
    
    // 触发下载
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (error) {
    console.error('使用html2canvas下载失败，尝试备用方法:', error);
    // 回退到基本方法
    downloadChartAsPNG(chartId, fileName);
  }
};

/**
 * 通用的图表下载函数
 * 自动选择最佳下载方法
 */
export const downloadChart = async (chartId: string, fileName: string): Promise<void> => {
  try {
    // 首先尝试使用html2canvas方法
    await downloadChartWithHtml2Canvas(chartId, fileName);
  } catch (error) {
    console.error('图表下载失败:', error);
    // 如果失败，显示错误提示
    alert('图表下载失败，请确保图表已完全加载后再试。');
  }
};

export default {
  downloadChartAsPNG,
  downloadChartWithHtml2Canvas,
  downloadChart,
};
