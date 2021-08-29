function GetCardDetails() {
    let cardname = document.querySelector('#card-name').value.trim();
    let cardnumber = document.querySelector('#card-number').value.trim();
    let cardexpmonth = document.querySelector('#card-exp-month').value.trim();
    let cardexpyear = document.querySelector('#card-exp-year').value.trim();
    let cardcvv = document.querySelector('#card-cvv').value.trim();
    let cardpostal = document.querySelector('#card-postal').value.trim();

    let cardDetails = {
        cardname: cardname,
        cardnumber: cardnumber,
        cardexpmonth: cardexpmonth,
        cardexpyear: cardexpyear,
        cardcvv: cardcvv,
        cardpostal: cardpostal,
    };

    return cardDetails;
}
