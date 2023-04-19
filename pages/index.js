import axios from 'axios'
import useSwr from 'swr'

const fetcher = (url) => axios.get(url).then((res)=>res.data);

function HomePage(){

    const {data, error, isLoading} = useSwr('/api/init',fetcher)

    console.log(error);

    if(isLoading){
        return(
            <div>
                Loading....
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
            <button onClick={()=>{
                axios.put('/api/save',data.body).then((res)=>res.data);

            }}>Click</button>
        </>
    )

}

export default HomePage
