# bttrxr

Command line interface for trading on bittrex.

## Features
+ bttrxr accepts percentages for buy/sell amounts and for buy/sell prices. This way, you don't have to type in an exact decimal value for anything.
+ The rates that bttrxr uses for the calculations are refreshed on every command. If you make a buy, it uses the lowest ask price in that instant of time. If you make a sell, it uses the highest bid price.
+ The list, balance, and order commands display in nice colored and formatted tables with several sorting options
+ This command saves alot of time. If you add your api keys to the environmental variables, you will rarely have to login to bittrex.
+ There is a --dryRun option for both buying and selling. This means you can use it for estimations and calculations as well as testing the commands before you run them.

## Installation
### Prerequisite

Have Node.js installed
```
npm install -g bttrxr
bttrxr --help
```

### Configuration

bttrxr looks for your api key and secret in the environmental variables
On Windows it's easiest to create an environmental variable for BITTREX_API_KEY and BITTREX_API_SECRET under your current user. You will have to restart your computer to have the environmental variables work in Windows.

in linux, add the following lines to the end of your .bashrc or .zshrc
```
export BITTREX_API_KEY=your-api-key
export BITTREX_API_SECRET=myreallylongsecret
```

## Commands
#### bttrxr balance [args]
lists your balances  
alias: bal  
example: ```bttrxr bal```

#### bttrxr list [currency] [args]
lists all markets for a currency  
alias: ls  
example: ```bttrxr ls``` (defaults to BTC)  
list eth markets: ```bttrxr ls eth```  
list top 10 highest % change bitcoin markets:  ```bttrxr ls -p -n 10```

#### bttrxr buy <currencyPair> [args]
buy some coins  
example ```bttrxr buy btc-eth -p 10``` use 10% of your bitcoin reserves to buy ethereum  
example ```bttrxr buy btc-eth -t 0.5 -r 0.09518962``` buy 0.5 btc worth of ethereum at a rate of 0.09518962  
example ```bttrxr buy btc-eth -a 4.2 -r 0.09518962 -d``` buy 4.2 ethereum a rate of 0.09518962 as a dry run  
example ```bttrxr buy btc-eth -t 0.5 -l 10 -d``` buy 0.5 btc worth of ethereum a rate of 10% lower than the current ask price  
example ```bttrxr buy --help``` get help for the buy command 

#### bttrxr sell <currencyPair> [args]
sell some coins  
example ```bttrxr sell btc-eth -p 10``` sell 10% of your etherium back to bitcoin at highest bid  
example ```bttrxr sell btc-eth -p 10 -l 20``` sell 10% of your etherium back to bitcoin at 20% higher than highest bid

#### bttrxr orders [args] 
list open orders  
alias: ord  
example ```bttrxr ord```

#### bttrxr cancel [args] 
cancel open orders  
alias: rm  
example ```bttrxr rm 8edc0f9e-2ffa-44c0-8864-278de9bc7dcc```

#### bttrxr --help
show the help menu

## Disclaimer
This is a dangerous command! Use it at your own risk! I am not responsible for the trades this program makes!  
You should always run it with the --dryRun argument first to get an estimate on your trade.  
I have thouroughly tested these commands with all their options and everything seems fine to me, but if you find an issue, feel free to submit it =)  
If you have any suggestions, feel free to submit them too! 

## License
MIT

### Donate?
If you like this program, feel free to donate some ethereum!  
```0x9C291207Af058dAb43328F87130B52f11Be9A369```