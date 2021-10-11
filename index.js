const express = require('express');
const app = express()
const bodyParser = require('body-parser')
const Coach = require('./Coach')
const User = require('./User')
const connectDB = require('./db')
const cors = require('cors')

app.use(cors())

connectDB();


app.post('/addCoach', (request, response) => {

    let arr = [];

    for (let i = 0; i < 80; i++) {
        arr.push({
            seatid: i,
            status: false
        })
    }

    const coach = new Coach({
        coachid: "4",
        seats: arr
    })

    coach.save().then(savedCoach => {
        response.json(savedCoach)
    })
})

let totalSeats = [];



app.get('/getCoach/:id', (request, response) => {
    let coachId = request.params['id']
    Coach.find({ 'coachid': coachId }, (err, coach) => {
        User.find({}, (err, bookings)=>{
            return response.send({
                coach, bookings
            })
        })
        
    })
})


app.get('/', (request, response) => {
    response.end('Hello world')
})


const calculation = (arr, tickets) => new Promise(async (resolve, reject) => {

    let rowAvailable = Array(12).fill(0)

    for (let i = 0; i < 80; i++) {
        let row = Math.floor(i / 7);
        if (arr[i].status === false) {
            rowAvailable[row]++;
        }
    }
    console.log(rowAvailable);
    for (let i = 0; i < 12; i++) {
        if (tickets <= rowAvailable[i] && tickets) {
            let avail = [];
            for (let j = 0; j < 7; j++) {
                if (i*7+j<80 && arr[i * 7 + j].status === false && tickets) {
                    avail.push({ seatid: arr[i * 7 + j].seatid });
                    arr[i * 7 + j].status = true;
                    tickets--;
                }
            }

            const user = new User({
                seats: avail
            })
            console.log("1");
            user.save().then(savedBooking => {
                console.log(savedBooking)
            })

            const coachUpdated = await Coach.findOneAndUpdate({coachid:'1'},{seats: arr}, {new: true})
            console.log(coachUpdated)

            console.log("2");

            resolve(true);
        }
    }

    let sum = 0;

    for(let i=0;i<12;i++){
        sum = sum + rowAvailable[i];
    }

    if(sum < tickets){
        resolve(false);
    }
    if(sum >= tickets && tickets){
        let i = 0;
        let avail = [];
        while(tickets){
            for (let j = 0; j < 7; j++) {
                if (i*7+j<80 && arr[i * 7 + j].status === false && tickets) {
                    avail.push({ seatid: arr[i * 7 + j].seatid });
                    arr[i * 7 + j].status = true;
                    tickets--;
                }
            }

            i++;
        }

        const user = new User({
            seats: avail
        })
        console.log("1");
        user.save().then(savedBooking => {
            console.log(savedBooking)
        })

        const coachUpdated = await Coach.findOneAndUpdate({coachid:'1'},{seats: arr}, {new: true})
        console.log(coachUpdated)

        resolve(true);
    }

    resolve(true);

})



let requestedSeats;
app.post('/bookSeats', bodyParser.json(), (request, response) => {
    console.log(request.body)
    requestedSeats = request.body.seats
    Coach.find({ 'coachid': '1' }, async (err, coach) => {
        totalSeats = coach[0].seats
        await calculation(totalSeats, requestedSeats)

        response.send("It works")
    })

})






app.listen(process.env.PORT || 5000, () => {
    console.log(`app is listening on port ${process.env.PORT}`)
})