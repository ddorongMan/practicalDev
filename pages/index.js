import axios from 'axios'
import useSwr from 'swr'
import {useEffect, useState} from 'react'

const fetcher = (url) => axios.get(url).then((res)=>res.data);

function HomePage(){

    const {data, error, isLoading} = useSwr('/api/init',fetcher);
    const [answer, setAns] = useState("오늘 서울 날씨를 확인하는 중입니다.");
    const [dots, setDots] = useState(".");

    useEffect(()=>{
        const interval = setInterval(()=>{
            setDots(dots+".");
            if(dots.length > 5) setDots(".")
        },250)
        return () => clearInterval(interval);
    })

    useEffect(()=>{
        if(!isLoading){
          axios.post('/api/question', {data:JSON.stringify(data)}).then((res)=>{
            setAns(res.data.choices[0].text);
          });  
        }
    },data)

    if(isLoading){
        return(
            <div>
                Loading {dots}
            </div>
        )
    }

    return (
        <>
            <div>
                {Object.keys(data.body.per).map((el)=>(
                    <div>{el} : {data.body.per[el]}배 : {data.body.stock[el]}원</div>
                ))}
            </div>
            <div>
                {answer} {answer=="오늘 서울 날씨를 확인하는 중입니다."?dots:""}
            </div>
            <button onClick={()=>{
                axios.put('/api/save',data.body).then((res)=>
                    {
                        window.alert("저장이 완료되었습니다.");
                    }
                );

            }}>Click</button>
        </>
    )

}

export default HomePage
