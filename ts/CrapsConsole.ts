
class CrapsConsole {

    originalInputElement:any;
    currentInputElement:any;

    game:Craps = new Craps();
    player:User;
    mainPotBet:number;
    sidePotBet:number;
    pointSet:boolean=false;
    pointMet:boolean=false;
    crappedOut:boolean=false;

    constructor(user:User){
        this.player=user;
    }
    initialize():void{
        this.originalInputElement=document.getElementById("input");
        this.currentInputElement=this.originalInputElement;
        this.currentInputElement.innerHTML="</br>TestingTesting</br>";
    }
    finalize():void{

    }
    run():void{
        this.initialize();
        this.welcomePlayer();
        this.game.determineFirstRoller();
        do {
            while (!this.pointSet) {//Continue to bet until the roller
                //throws a point instead of a win/loss.
                this.initialBet();
                this.pointSet = this.resolveInitialThrow(this.game.initialThrow());
            }
            while (!this.pointMet) {//Continue to bet until the roller
                //meets their point or craps out
                this.secondaryBet();
                this.pointMet = this.resolveSecondaryThrow(this.game.secondaryThrow());
            }
            if (this.crappedOut) {
                this.changeTurns();//Reset flags, change active player
            } else{
                this.resetFlags();
            }
        }while(this.game.play("Y"));//getStringInput("Continue playing? [Y/N] ")));
        //NEED TO REWORK PLAY AND INPUT TO ACCOUNT FOR HTML FORMS
        this.finalize();
    }

    initialBet():void{

        //System.out.println(game.toString());


        if (this.game.getPlayerTurn())
        {
            this.opponentInitialBets(this.generateBotBet());
        }
        else
        {
            this.playerInitialBets();
        }

    }
    playerInitialBets():void{
        do {
            //this.mainPotBet = this.getPositiveDoubleInput("How much would you like to bet? ");
        }while (this.player.Wallet.getMoney()<this.mainPotBet);

        this.game.takeBet(this.player.Wallet.takeOutMoney(this.mainPotBet));//player bet
        this.game.takeBet(this.mainPotBet);//house bet matches

        this.displayPlayerBetting(this.mainPotBet);

    }
    opponentInitialBets(betToMatch:number):void{
        this.game.takeBet(betToMatch);//house bet to match
        this.game.takeBet(this.player.Wallet.takeOutMoney(betToMatch));//player matches bet
        this.mainPotBet=betToMatch;

        this.displayOpponentBetting(betToMatch);
    }

    generateBotBet():number{
        return(Math.random()*(this.player.Wallet.getMoney()/2));
    }

    secondaryBet():void{

        //System.out.println(game.toString());

        if (this.game.getPlayerTurn())
        {
            this.opponentSecondaryBets(this.generateBotBet());
        }
        else
        {
            this.playerSecondaryBets();
        }
    }
    playerSecondaryBets():void{
        do {
            //this.sidePotBet = getPositiveDoubleInput("How much would you like to bet? ");
        }while (this.player.Wallet.getMoney()< this.sidePotBet);

        this.game.takeSideBet(this.player.Wallet.takeOutMoney(this.sidePotBet));//player bet
        this.game.takeSideBet(this.sidePotBet);//house bet matches

        this.displayPlayerBetting(this.sidePotBet);
    }
    opponentSecondaryBets(betToMatch:number):void{

    this.game.takeSideBet(betToMatch);//house bet to match
    this.game.takeSideBet(this.player.Wallet.takeOutMoney(betToMatch));//player matches bet
    this.sidePotBet=betToMatch;

    this.displayOpponentBetting(betToMatch);
}

    resolveInitialThrow(resultOfThrownDice:number):boolean{
        if (resultOfThrownDice!=0){
            //non-Thrower (-1) or thrower (1) wins the mainPotBet
            this.resolveInitialThrowBet(resultOfThrownDice);
            return false;
        }
        //Point for the first time
        this.firstPointRolled();
        return true;
    }
    resolveInitialThrowBet(a:number):void{
        if (a==1){
            if (this.game.getPlayerTurn()){//If the thrower is the player and they won, pay them
                this.playerWinsBothPots();//Player wins the pot and we go back to bet again
            }
            else//If the bot is the thrower, empty the pot
            {
                this.opponentWinsBothPots();//mainPotBet will be overwritten in the next
                //function call, so we can use it here to catch this
                //method's return
            }
        }
        else {
            if (this.game.getPlayerTurn()) {//If the thrower is the player and they lost, empty the pot and bet again
                this.opponentWinsBothPots();
            }
            else{//if the bot is the thrower and they lost, pay the player
                this.playerWinsBothPots();
            }
        }
    }

    resolveSecondaryThrow(resultOfThrownDice:number):boolean{
        switch (resultOfThrownDice) {

            case 0: {//Not a point, not a pair, not a crap. Roll again
                this.neitherWinsAnyPot();
                return false;
            }
            case -1: {//Crapped out. pay non-thrower
                this.crappedOut=true;
            }
            case 1 : {//Point met. Pay out to thrower
                this.resolveSecondaryThrowBet(resultOfThrownDice);
                return true;
            }
            default: {//Pair made, pay sideBet to non-thrower.
                this.resolveSecondaryThrowBet(resultOfThrownDice);
                return false;
            }
        }//end switch
    }
    resolveSecondaryThrowBet(a:number):void{
        if (a==1){//Point met, pay out thrower from mainPot and sidePot
            if (this.game.getPlayerTurn())
            {//if player is the thrower, give them the pots and then reset bet vars
                this.playerWinsBothPots();

            }
            else//if player is not the thrower, empty pot and reset bet vars
            {
                this.opponentWinsBothPots();
            }
        } else
        if(a==-1)//Crapped out. Pay out the non-thrower from mainPot and sidePot
        {
            if (this.game.getPlayerTurn())
            {
                this.opponentWinsBothPots();
            }
            else
            {
                this.playerWinsBothPots();
            }
        } else//Won the pair, but not the point. Pay non-thrower the sidePot
        {
            if (this.game.getPlayerTurn())
            {
                this.playerWinsSidePot();
            }
            else
            {
                this.opponentWinsSidePot();
            }
        }
    }

    displayOpponentBetting(passedOpponentBet:number):void{//Called _AFTER_ the money transfers have already taken place
    //        System.out.println(game.toString()); //Move to betting logic in order to make it consistent with displayPlayerBetting()
    //     System.out.println("Opponent bets "+defaultFormat.format(passedOpponentBet));
    //     System.out.println("You match "+defaultFormat.format(passedOpponentBet));
    //     System.out.println("You have "+defaultFormat.format(player.getWallet().getMoney())+" in your wallet");
        this.printPots();
        this.enterAnyKeyToContinue();
    }
    displayPlayerBetting(passedPlayerBet:number):void{//Called _AFTER_ the money transfers have already taken place
        //_AND_ after the player enters their bet amount
        // System.out.println("You bet "+defaultFormat.format(passedPlayerBet));
        // System.out.println("Opponent matches "+defaultFormat.format(passedPlayerBet));
        // System.out.println("You have "+defaultFormat.format(player.getWallet().getMoney())+" in your wallet");
        this.printPots();
        this.enterAnyKeyToContinue();
    }

    firstPointRolled():void{
        // System.out.println(game.getNumberRolled()+" was rolled... that's our new point.");
        // System.out.println("You have "+defaultFormat.format(player.getWallet().getMoney())+" in your wallet now.");
        this.printPots();
        this.enterAnyKeyToContinue();

    }
    neitherWinsAnyPot():void{
        // System.out.println("A "+game.getNumberRolled()+" was rolled... nothing special.");
        // System.out.println("You have "+defaultFormat.format(player.getWallet().getMoney())+" in your wallet now.");
        this.printPots();
        this.enterAnyKeyToContinue();
    }
    playerWinsSidePot():void{

        // System.out.println("A "+game.getNumberRolled()+" was rolled, and you won the Side Pot!");
        // System.out.println(defaultFormat.format(game.getSidePot().getMoney())+" from Side Pot");

        this.player.Wallet.addMoney(this.game.emptySidePot());

        // System.out.println("You have "+defaultFormat.format(player.getWallet().getMoney())+" in your wallet now");
        this.printPots();

        this.enterAnyKeyToContinue();

        this.sidePotBet=0;
    }
    opponentWinsSidePot():void{
        // System.out.println("A "+game.getNumberRolled()+" was rolled, and your opponent won the Side Pot!");
        // System.out.println(defaultFormat.format(game.getSidePot().getMoney())+" from Side Pot");

        this.sidePotBet=this.game.emptySidePot();

        // System.out.println("You have "+defaultFormat.format(player.getWallet().getMoney())+" in your wallet now");
        this.printPots();

        this.enterAnyKeyToContinue();

        this.sidePotBet=0;
    }
    opponentWinsBothPots():void{
        // System.out.println("A "+game.getNumberRolled()+" was rolled, and your opponent won everything!");
        // System.out.println(defaultFormat.format(game.getMainPot().getMoney())+" from Main Pot");
        // System.out.println(defaultFormat.format(game.getSidePot().getMoney())+" from Side Pot");

        this.mainPotBet=this.game.emptyPot();
        this.sidePotBet=this.game.emptySidePot();

        // System.out.println("You have "+defaultFormat.format(player.getWallet().getMoney())+" in your wallet now");
        this.printPots();

        this.enterAnyKeyToContinue();

        this.mainPotBet=0;
        this.sidePotBet=0;
    }
    playerWinsBothPots():void{

        // System.out.println("A "+game.getNumberRolled()+" was rolled, and you won everything!");
        // System.out.println(defaultFormat.format(game.getMainPot().getMoney())+" from Main Pot");
        // System.out.println(defaultFormat.format(game.getSidePot().getMoney())+" from Side Pot");

        this.player.Wallet.addMoney(this.game.emptyPot());
        this.player.Wallet.addMoney(this.game.emptySidePot());

        // System.out.println("You have "+defaultFormat.format(player.getWallet().getMoney())+" in your wallet now");
        this.printPots();

        this.enterAnyKeyToContinue();
        this.mainPotBet=0;
        this.sidePotBet=0;
    }

    welcomePlayer():void{
    //System.out.println("Hello, "+player.getName()+". Welcome to the "+game.getClass().getSimpleName()+" table.");
    }
    changeTurns():void{
        this.resetFlags();
        this.game.changePlayerTurn();
    }
    resetFlags():void{
        this.mainPotBet=0;
        this.sidePotBet=0;
        this.pointSet=false;
        this.pointMet=false;
        this.crappedOut=false;
        this.game.resetTurn();
    }

    printPots():void{
    // System.out.println(defaultFormat.format(game.getMainPot().getMoney())+" now in Main Pot");
    // System.out.println(defaultFormat.format(game.getSidePot().getMoney())+" now in Side Pot");
    }
    enterAnyKeyToContinue():void{
    //String dump = getStringInput("Enter any key to continue: ");
    }
}