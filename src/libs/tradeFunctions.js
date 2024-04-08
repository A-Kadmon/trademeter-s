/*export function calculateDailyInterest(startMoney, days, partOfDepositInPercents, finalPercentage) {
    const finalAmount = startMoney * (1 + finalPercentage / 100);
    const ratio = 1 + partOfDepositInPercents / 100;
    const rate_ = Math.pow(finalAmount / startMoney, 1 / days) * ratio - ratio;
    const percentPerDay = rate_ * 100;
    return percentPerDay;
}*/

export function dailyToIters( iters, part, finalPercent ) {
    return finalPercent/iters/part*100;
/*    const ratio = 1 + finalPercent;
    part /=100;
    return (finalPercent/part)**(1/iters);*/
}

/*

js function:

    Input:
startMoney: float, days: int, partOfDepositInPercents: float, finalPercentage: float

Output:
    percentPerDay.
        so that the calculated rate_ `percentPerDay` for given days, with this deposit ratio `partOfDepositInPercents` was equal to (`startMoney` with `finalPercentage`).
daily percentage of deposit is compounded daily
*/
