# pv-total-react
Rewriting everything to react, because why not?

For the first time, run
```shell
npm install
```

To compile and start a live server, run
```shell
npm start
```

# Build issues:
## Proper pull
```
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_ed22519
git pull
```

## Soft linking the data in the build folder

```
~/pv-total-react/build$ ln -s ../../dataset/ data
```
