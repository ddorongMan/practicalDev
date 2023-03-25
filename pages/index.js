import axios from 'axios'
import parse from 'node-html-parser'
import iconv from 'iconv-lite'

export async function getServerSideProps(context){
    let code = await axios.get("http://" + context.req.headersDistinct.host[0] +"/data/entList.json")
    .then((res)=> {return (res.data)});

    let per = {};
    let stock = {};
    for (const cd of Object.keys(code)) {
        await axios({
            method: "GET",
            url: "https://finance.naver.com/item/main.naver?code=" + cd,
            responseType: "arraybuffer"
        }).then((res) => {
            let tab = parse(iconv.decode(res.data, "EUC-KR")).getElementById("tab_con1");
            let info = {};
            tab.getElementsByTagName("tr").forEach((el) => {
                let key = el.getElementsByTagName("th")[0];
                let deleteInfo = el.getElementsByTagName("th")[0].getElementsByTagName("div");
                for (const info of deleteInfo) {
                    key.removeChild(info);
                }
                let newKey = key.innerText
                    .replace(/[\t\n\s]/g, "")
                    .replace("l", "|");
                let val = el.getElementsByTagName("td")[0].innerText
                    .replace(/[\t\n]/g, "")
                    .replace("l", "|")
                    .replace("배", "");
                info[newKey] = val;
            });
            per[code[cd]] = info["PER|EPS(2022.12)"] != null ? info["PER|EPS(2022.12)"].split("|")[0] : info["PER|EPS(2022.09)"]?.split("|")[0];
            let chart = parse(iconv.decode(res.data, "EUC-KR")).getElementById("chart_area");
            stock[code[cd]] = Number.parseInt(chart.getElementsByTagName("em")[0].getElementsByTagName("span")[0].innerText.replace(",", ""));
        })
    }

        return {
            props: {
                per: per,
                stock: stock
            }
        }
}

function HomePage({per, stock}){

    return (
        <div>
            {Object.keys(per).map((el)=>(
                <div>{el} : {per[el]}배 : {stock[el]}원</div>
            ))}
        </div>
    )

}

export default HomePage