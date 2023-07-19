const express=require("express")
const app=express()
app.use(express.json())
const sqlite3 =require("sqlite3")
const path=require("path")
const dbpath=path.join(__dirname,"cricketMatchDetails.db")

const {open}=require("sqlite")


const InitializeDb = async()=>{
try{
    db=await open({
filename:dbpath,
driver:sqlite3.Database
   })
   app.listen(3000,()=>{
console.log("SERVER WALKING")
   })
}
catch(e){
    console.log(`DB ERROR ${e.message}`)
    process.exit(1)
}

}
InitializeDb();

//API 1
app.get("/players/",async(request,response)=>{
 
    const Query =`select * from player_details`
const result=await db.all(Query)
response.send(result.map((i)=>({
    playerId:i.player_id,
     playerName:i.player_name
})))

        
})




//API 2

app.get("/players/:playerId/",async(request,response)=>{
    const{playerId}=request.params;
    const Query =`select * from player_details
                    where player_id=${playerId}`
const result=await db.get(Query)

response.send({ playerId:result.player_id,
     playerName:result.player_name})
});

//API 3
app.put("/players/:playerId/",async(request,response)=>{
  const{playerId}=request.params;
const details=request.body;
const {playerName} = details;  
console.log(playerName);
     const Query =`update player_details
                    set player_name='${playerName}'
                    where player_id=${playerId}`
const result=await db.run(Query)

response.send("Player Details Updated")
      
})



//API 4

app.get("/matches/:matchId/",async(request,response)=>{
    const {matchId}=request.params;
    const Query=`select * from match_details
    where match_id=${matchId}`
const result=await db.all(Query)
response.send(result.map((i)=>({
    matchId:i.match_id,
    match:i.match,
    year:i.year
})))


})



//API 5
app.get("/players/:playerId/matches",async(request,response)=>{
       
const {playerId}=request.params;

const Query=`select * from match_details inner join player_match_score on
match_details.match_id=player_match_score.match_id
where player_match_score.player_id=${playerId}`

const result =await db.all(Query)

response.send(result.map((i)=>({
      matchId:i.match_id,
    match:i.match,
    year:i.year
})))
})


//API 6

app.get("/matches/:matchId/players",async(request,response)=>{

const {matchId}=request.params;
const Query=`select player_details.player_id as playerId,player_details.player_name
as playerName from (match_details inner join player_match_score
on match_details.match_id=player_match_score.match_id) AS T inner join 
player_details on player_details.player_id=T.player_id
where T.match_id=${matchId}`


const result=await db.all(Query)


response.send(result)

      
})


//API 7
app.get("/players/:playerId/playerScores/",async(request,response)=>{

const {playerId}=request.params;
const Query=`select distinct player_details.player_id as playerId,player_details.player_name 
as playerName,
sum(player_match_score.score) as totalScore,sum(fours) as totalFours,sum(sixes) as
totalSixes from player_details inner join player_match_score on
player_details.player_id=player_match_score.player_id
where player_details.player_id=${playerId}`

const result=await db.all(Query)


response.send(result)

      
})
module.exports=app;