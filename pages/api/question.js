import axios from 'axios'

let auth = "Bearer " + process.env.API_KEY;

export default async function handler(request, response){
    try{
        await axios({
            method: "POST",
            url: "https://api.openai.com/v1/completions",
            headers: {"Content-Type":"application/json", "Authorization": auth},
            data: {
                "model": "text-davinci-003",
                "prompt": "오늘 서울 날씨는 어떻니?",
                "temperature": 0,
                "max_tokens": 2000
            }
        }).then((res)=>{
            response.status(200).json(res.data);
        });
    }catch(e){
        console.log(e.code);
        console.log(e);
    }
}