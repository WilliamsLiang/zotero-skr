cd src
# 获取 manifest.json 中的 version 字段值
VERSION=$(grep '"version"' manifest.json | sed -E 's/.*"version": "([^"]+)".*/\1/' | tr -d '\r')
# 使用提取到的版本号进行打包，文件命名指明适用于 Zotero 7-9 版本
zip -r "../skr-zotero7-9-${VERSION}.xpi" * -x "*.DS_Store" "__MACOSX/*"
