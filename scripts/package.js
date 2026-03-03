import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取 __dirname (ES modules workaround)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 package.json 获取版本号
const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;
const projectName = 'think-prism';

// 定义路径
const distDir = path.resolve(__dirname, '../dist');
const releaseDir = path.resolve(__dirname, '../release');
const zipFileName = `${projectName}-v${version}.zip`;
const zipFilePath = path.join(releaseDir, zipFileName);

// 确保 release 目录存在
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

// 如果 zip 文件已存在，先删除
if (fs.existsSync(zipFilePath)) {
  fs.unlinkSync(zipFilePath);
  console.log(`Removed existing release file: ${zipFilePath}`);
}

console.log(`Packaging ${projectName} v${version}...`);

// 检查 dist 目录是否存在
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory not found. Please run "npm run build" first.');
  process.exit(1);
}

// Windows 下使用 PowerShell Compress-Archive
// 注意：dist/* 会包含子目录结构
try {
  // 构建 PowerShell 命令
  // Compress-Archive -Path "dist\*" -DestinationPath "release\think-prism-v1.0.0.zip" -Force
  // 注意路径分隔符在 Windows 下最好用反斜杠，但在 PowerShell 中正斜杠也可以
  const psCommand = `Compress-Archive -Path "${distDir}\\*" -DestinationPath "${zipFilePath}" -Force`;
  
  console.log('Executing PowerShell command:', psCommand);
  execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });
  
  console.log(`\nSuccessfully packaged extension to: ${zipFilePath}`);
} catch (error) {
  console.error('Failed to package extension:', error);
  process.exit(1);
}
