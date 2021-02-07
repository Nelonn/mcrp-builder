# MCRP Builder
MCRP Builder - программа которая может объединить несколько майнкрафт ресурспаков
 
## Установка:
1. Скачайте [последнюю версию](https://github.com/Nelonn/mcrp-builder/releases/latest)
1. Установите последнюю версию [Node.JS](https://nodejs.org/en/)
1. Настройте билдер по инструкции ниже
1. Скопируйте ваши ресурспаки в рабочую папку билдера
1. Запустите `build.bat`

## Настройка:
### Как выбрать рабочую папку
Файл `config.json`:
```json
{
  "workspace": "example"
}
```
Тут в переменной `workspace` вы выбираете рабочую папку которые создаются в папке `workspaces`

___
### Как создать рабочую папку
1. Переходим в папку `workspaces`
1. Копируем файл `example.json`
1. Называем его любым именем

Файл `example.json`:
```json
{
  "source_folder": "C:\\Users\\!!YOUR_USERNAME!!\\AppData\\Roaming\\.minecraft\\resourcepacks\\example-resource-pack-dev\\build_files",
  "build_folder": "C:\\Users\\!!YOUR_USERNAME!!\\AppData\\Roaming\\.minecraft\\resourcepacks\\example-resource-pack-builded",
  "clear": {
    "enable": false,
    "folder": "C:\\Users\\!!YOUR_USERNAME!!\\AppData\\Roaming\\.minecraft\\resourcepacks\\example-resource-pack-dev\\build_files\\first_rp",
    "black_list": [
      ".psd",
      ".txt",
      ".flp",
      ".wav",
      ".mp3",
      ".zip",
      ".example.png"
    ]
  }
}
```

`source_folder` - папка c ресурспаками для билда\n
`build_folder` - папка с собранным ресурспаком
#### clear
`enable` - включить / выключить очиститель от лишних файлов\n
`folder` - какую папку чистить\n
`blacklist` - чёрный список расширений для очистки

## Автор:
Михаил Неонов
[Twitter](https://twitter.com/thenelonn)
[YouTube](https://www.youtube.com/channel/UCnZDAQizhP4rvDNbqQxG_pA)