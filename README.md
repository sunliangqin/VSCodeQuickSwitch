![Quick Switch](images/quick-switch.gif)

The following setting enables quick switch among .cpp, .h and _ut.cpp files.

```json
"quickSwitch.fileGroups": [
    {
        "pattern": "(.+?)(_ut\\.cpp|\\.cpp|\\.h)",
        "list": [
            "$1.cpp",
            "$1.h",
            "$1_ut.cpp"
        ]
    }
]
```
1. pattern: a regular expression to match with the current file path. The first group that matches will be used for quick switch.
1. list: an ordered list of files for quick switch. Use $n to reference the capturing groups defined in pattern.

When you are in one of the .cpp, .h or _ut.cpp file, you can
* Press `Ctrl+Alt+N` to switch to the next file in the list
* Press `Ctrl+Alt+P` to switch to the previous file in the list
* Press `Ctrl+Alt+S` to switch to a file from quick pick
* Press `Ctrl+Alt+1` to switch to the .cpp file (the first file in the list)
* Press `Ctrl+Alt+2` to switch to the .h file (the second file in the list)
* Press `Ctrl+Alt+3` to switch to the _ut.cpp file (the third file in the list)