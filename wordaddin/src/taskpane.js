function numberToWords(num) {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];

  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + " Crore " + inWords(n % 10000000);
  }

  return inWords(num) + " Only";
}
async function generateDoc() {
  await Word.run(async (context) => {

    const name = document.getElementById("name").value;
    const designation = document.getElementById("designation").value;
    const amount = parseInt(document.getElementById("amount").value);
    const rule = document.getElementById("rule").value;
    const purpose = document.getElementById("purpose").value;

    const te = document.getElementById("te").value;
    const balance = document.getElementById("balance").value;
    const subscription = document.getElementById("subscription").value;
    const refunds = document.getElementById("refunds").value;
    const da = document.getElementById("da").value;
    const withdrawals = document.getElementById("withdrawals").value;

    const total =
      Number(te) +
      Number(balance) +
      Number(subscription) +
      Number(refunds) +
      Number(da);

    const net = total - Number(withdrawals);

    const words = numberToWords(amount);

    const body = context.document.body;

    const text = `
Govt. of Jammu and Kashmir (UT)
OFFICE OF THE CHIEF EDUCATION OFFICER BARAMULLA

Subject:- Grant of G.P Fund Advance.

Sir,

Kindly find enclosed herewith the G.P.Fund case under Rule ${rule}
for withdrawal of Rs.${amount} (${words})
in favour of Mr./Mrs ${name}, ${designation}
to meet expenditure on ${purpose}.

Balance Details:

1. TE Amount: Rs.${te}
2. Balance Slip: Rs.${balance}
3. Subscription: Rs.${subscription}
4. Refunds: Rs.${refunds}
5. DA: Rs.${da}
6. Total: Rs.${total}
7. Withdrawals: Rs.${withdrawals}
8. Net Balance: Rs.${net}

Yours faithfully,
Chief Education Officer
Baramulla
`;

    body.clear();
    body.insertText(text, "Replace");

    await context.sync();
  });
}
function savePrintPage() {
  const page = prompt("Enter last printed page:");
  Office.context.document.settings.set("lastPrintedPage", page);
  Office.context.document.settings.saveAsync();
}
function resumePrint() {
  const lastPage = Office.context.document.settings.get("lastPrintedPage") || 1;
  alert("Print from page: " + lastPage);
}