# Lokaverkefni

# Uppsetning

* Þú skrifar `npm install` til að setja upp öll dependency.
* Þú skrifar svo `npm start` til að starta vefsíðunni.
* Síðan krefst þess að þú sért með tengingu við PostgreSQL.
* Þú þarft að búa til gagnagrunn í PostgreSQL sem heitir `FlightData`.a
* Þú þarft að stilla notendanafn og lykilorð í gagnagrunninn í 4. línu í `dbConnect.js`
    (lykilorð:notendanafn)
* Um leið og þú ferð inná 'Statistics' hlutann, þá eru tvær töflur búnar til í gagnagrunninum.
* Á þessum tímapunkti þarftu mjög líklega að refresha gagnagrunninn svo hann fatti að töflurnar séu til staðar.
* Refreshaðu svo síðuna sjálfa og gögnin ættu að birtast. Ef ekki, bíddu þá í smá stund og reyndu svo aftur, þar sem við erum með timer stilltan sem nær í gögnin.  Hægt er að stilla timerinn eða sjá á hvað hann er stiltur með því að nota MINUTE_INTERVAL breytuna í flightSaver.js.  Timerinn er stilltur á 1 mínútu í þessari útgáfu forritsins.
