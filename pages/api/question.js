import axios from 'axios'

let auth = "Bearer " + "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";

export default async function handler(request, response){
    try{
        await axios({
            method: "POST",
            url: "https://api.openai.com/v1/completions",
            headers: {"Content-Type":"application/json", "Authorization": auth},
            data: {
                "model": "text-davinci-003",
                "prompt": Object.keys(JSON.parse(request.body.data).body.per)+"의 각 업체별 현재 상황을 요약해서 알려줄래?",
                "temperature": 0,
                "max_tokens": 2000
            }
        }).then((res)=>{
            response.status(200).json(res.data);
        });
    }catch(e){
        console.log(e.code);
    }
}