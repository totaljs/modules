# Full-text search

__EXPERIMENTAL__. This module can parse data according to the full-text search. It uses a great algorithm for finding pharses.

__Requirements__:

- Total.js v5

__Example__:

```js
var parsers = [];

// Alza
parsers.push(function(fulltext) {

	let count = fulltext.search({ search: 'Alza', parse: false }).count;
	if (!count) {
		fulltext.clear();
		return;
	}

	let value = fulltext.search({ search: 'Dátum vystavenia:', match: /\d{2}\.\d{2}\.\d{4}/, clean: /\s/g, convert: 'dd.MM.yyyy' }).set('created').items;
	let first = value[0];
	first && fulltext.set('customer.name', first.text.substring(first.text.indexOf(first.matched) + first.matched.length).trim());
	fulltext.search({ search: 'Variabilný symbol:' }).set('vs');
	fulltext.search({ search: 'Dátum splatnosti:', match: /\d{2}\.\d{2}\.\d{4}/, clean: /\s/g, convert: 'dd.MM.yyyy' }).set('due');
	fulltext.search({ search: 'Predávajúci:' }).set('issuer.name').search({ search: 'IČO:', match: /\d+/, to: '+2' }).set('issuer.id').search({ search: 'IČ DPH:', match: /[A-Z0-9]+/, to: '+2' }).set('issuer.vatid');
	fulltext.search({ search: 'Názov banky:' }).search({ search: 'IČO:', match: /\d+/, from: '+1', to: '+2' }).set('customer.id').search({ search: 'DIČ:', match: /[A-Z0-9]+/, to: '+2' }).set('customer.taxid').search({ search: 'IČ DPH:', match: /[A-Z0-9]+/, to: '+2' }).set('customer.vatid');
	fulltext.search({ search: 'Celkom:' }).set('total').search({ search: /\d+(\s)?%/, from: '+1', to: '+1', clean: /\s/g }).set('tax');
	return fulltext.response;
});

// Invoice scan:
var fulltext = MODS.fulltext.load(`Q alzas  rnggemesenem (HHH

zarucny a dodaci list
Predévajúci: Alza.sk s.r.o.

Sliagska 1/D, 83102 Bratislava-Nové Mesto, ICO: 36562939, IC DPH: SK2021863811, Web: www.alza sk, Kontakt: www.alza.sk/kontakt, Tel:
+421 257 101 800

OR MS Bratislava lll, oddiel Sro, vioZka &islo 35889/B

Darfovy doklad: Faktira Kupujiici:
Datum vystavenia: ) 20.02.2024 Total Avengers s.r. o.
Datum uskut. dari. plnenia: 20.02.2024 }
Datum splatnosti: 05.03.2024 Viestova 6784/28
Datum prevzatia 21.02.2024 97401 Banska Bystrica
Spésob uhrady: Terminalom
Bankovy
Nazov banky: Slovenska sporitel'ia, a.s. Bratislava @ v
IBAN: SK2000000000005033845424 ICO: 50679996 DIC: 2120417167
BIC/SWIET: GIBASKBX IC DPH: SK2120417167
Nazov banky: ESOB SK E-mail: info@totalavengers.com
IBAN: SK6875000000004001969241 Tl#421903163302
BIC/SWIFT: CEKOSKBX
Variabilny symbol: 5012660451
Kod Popis Ks Cena ks bez DPH DPH DPH% Cena Zaruka
RZ351b  Digitalny fotoaparat RICOH GR III Cierny 1 759,00 759,00 151,80 20 910,80 24 PX
SL190r ~~ Nehmotny produkt Doprava tovaru / Na 1 217 217 0,43 20 2,60 0AL
dobierku / Doruéenie na predajiiu
SL083d4 Nehmotny produkt ZI'ava na dopravu 1 -2,17 -217 -0,43 20 -2,60 0AL
JO194a9 +ZADARMO Stativ JOBY 1 0,00 0,00 0,00 0 0,00 0
Celkom: 910,80 EUR
Vyeislenie DPH v EUR: I
Sadzba Zéklad DPH Zaoknihlenie: 250 EUR
Celkom: 910,80 EUR
20% 759,00 151,80
0% 0,00 0,00
Nehrad'te, zaplatené kartou.
Identifikacia produktu:
RZ351b: SN: 0141189300175,
Recyklacny prispevok za ks:
RZ351b: 0,06 EUR

Odporicame tovar skontrolovat ihned’ po prevzati, neskorsie pripomienky k stavu odovzdaného tovaru mézu byt zamietnuté. Kupujci
ziskava Viastnické prava k tovaru aZ po uplnom zaplateni kupnej ceny. V cene tovaru je zahmuty recyklacny poplatok a autorské odmeny v
uzékonenej vyske. Viac informécii o podmienkach zaruky najdete vo VSeobecnych obchodnych podmienkach a Reklamacnom poriadku na
www.alza. sk.

Sluzby, ktoré ste zabudli kupit’

Typ sluzby: Mozno zakiipit’
Digitalni fotoaparat Ricoh GR Ill éerny:

- sluzba Poji§téni prodlouzené zaruky 24 mésicli 138,14 € 05.03.2024
- sluzba Zaruka okamzité vymény 109,30 € 05.03.2024
- sluzba Zaruka okamzité vymény 109,30 € 05.03.2024
- sluzba Poji§téni prodlouzené zaruky 12 mésicl 9184 € 05.03.2024

Oslovte, prosim, obchodnikov v zelenych trickach, s vyberom tovaru Vam radi pomézu

Ochranny znak El Strana 1z 2 Tlac: PDFGen 1.39 2/21/2024 8:50:33 AM
02G9686VD1C2A4A244W24A233E538232B5F 25

Alzakariéra
Paci sa vam Alza? Pridte pracovat pre nas! Pozrite sa na nase volné pracovné miesta.
https:/fiwww.alza. sk/kariera

Ochranny znak El Strana 2z 2 Tlac: PDFGen 1.39 2/21/2024 8:50:33 AM
02G9686VD1C2A4A244W24A233E538232B5F 25`);

for (let parser of parsers) {
	var output = parser(fulltext);
	if (output) {
		console.log(output);
		break;
	}
}
```

__Output__:

```js
{
  created: 2024-02-20T00:00:00.000Z,
  customer: {
    name: 'Total Avengers s.r. o.',
    id: '50679996',
    taxid: '2120417167',
    vatid: 'SK2120417167'
  },
  vs: '5012660451',
  due: 2024-03-05T00:00:00.000Z,
  issuer: { name: 'Alza.sk s.r.o.', id: '36562939', vatid: 'SK2021863811' },
  total: '910,80 EUR',
  tax: '20%'
}
```