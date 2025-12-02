import { authFetch, API_URL } from "./config.js";

const BASE_URL = `/expenses`;

let last_get ;
 
export class Expense{
    /**
     * 
     * @param { { 
     *        familia_id,usuario_resp_id, valor_desp,
     *        nome,categoria,dt_compra,tipo_desp: "normal" | "mensal" | "anual" ,
     *        dataVencimento,numeroParcelas}} params 
     */
    static   create = async (params) => {
        const ENDPOINT = `${BASE_URL}/`;
        const options = {
            method: 'POST',

            body:JSON.stringify(params)
        }
        const response =  await authFetch(ENDPOINT, options);
        if(!response.ok){

            console.log(`Erro ao criar despesa`);
            console.error(response.json || response.text());
            return {error:true,...response.json()}
        }

        let data = await response.json();
        return data;
    }

    static    getByRangeAndFamily = async (params) => {
        const {familia_id,mes,ano} = params
        const ENDPOINT = `${BASE_URL}/family?familia_id=${familia_id}&mes=${mes}&ano=${ano}`;
        
        const response =  await authFetch(ENDPOINT,{ method: 'GET'});
        if(!response.ok){
            return {error:true,...response.json()}
        }
        let data = await response.json();
        console.log(data);
        
        return data;
    }
}
//export const Expense = { create:createExpense,getByRangeAndFaml:getExpensesByFamily}