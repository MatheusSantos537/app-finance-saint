import { secureSum } from "../utils/utils.js";
import { authFetch, API_URL } from "./config.js";
import { Preferences } from '@capacitor/preferences';
 
const BASE_URL = `/expenses`;

// --- CONFIGURAÇÃO DO CACHE ---
const CACHE_PREFIX = "saint_finance_cache_";
const CACHE_DURATION_HOURS = 1;
 
export class Expense{

    static _getCacheKey(familia_id, mes, ano) {
        return `${CACHE_PREFIX}${familia_id}_${mes}_${ano}`;
    }

    static async _saveToCache(key, data) {
        const objectToSave = {
            timestamp: new Date().getTime(),
            payload: data
        };
        await Preferences.set({
            key: key,
            value: JSON.stringify(objectToSave)
        });
        console.log(`[CACHE] Salvo: ${key}`);
    }

    static async _getFromCache(key) {
        const { value } = await Preferences.get({ key: key });
        if (!value) return null;

        try {
            const cachedData = JSON.parse(value);
            const now = new Date().getTime();
            const diffHours = (now - cachedData.timestamp) / (1000 * 60 * 60);

            if (diffHours < CACHE_DURATION_HOURS) {
                console.log(`[CACHE] Hit (${diffHours.toFixed(1)}h): ${key}`);
                console.log(`PAYLOAD CACHE`,cachedData.payload)
                return cachedData.payload;
            } else {
                console.log(`[CACHE] Expirado. Buscando novo...`);
                return null; 
            }
        } catch (e) {
            return null;
        }
    }


    /**
     * 
     * @param { { 
     *        familia_id,usuario_resp_id, valor_desp,
     *        nome,categoria,dt_compra,tipo_desp: "normal" | "mensal" | "anual" ,
     *        dataVencimento,numeroParcelas}} params 
     */
    static create = async (params) => {
        const ENDPOINT = `${BASE_URL}/`;
        const options = {
            method: 'POST',
            body: JSON.stringify(params)
        };

        const response = await authFetch(ENDPOINT, options);

        if (!response.ok) {
            return { error: true, ...(await response.json().catch(() => ({}))) };
        }

        // Este objeto 'despesaCriada' terá o formato do seu dataExample.js
        // Ex: [data:{ id: "...", descricao: "...", dataCompra: "2025-12-..." }]
        const despesaCriada = await response.json();
        console.dir(despesaCriada);

        // --- ATUALIZAÇÃO INTELIGENTE DO CACHE ---
        try {
           
            const dataString = despesaCriada.dataVencimento;
            
            const dataRef = new Date(dataString); 
            
          
            
            const mes = dataRef.getMonth() + 1; // 0-11 -> 1-12
            const ano = dataRef.getFullYear();

            // Usa o ID da família que enviamos no form params
            const cacheKey = this._getCacheKey(params.familia_id, mes, ano);

            const currentList = await this._getFromCache(cacheKey);

            if (currentList && Array.isArray(currentList)) {
                for (let index = 0; index < despesaCriada.data.length; index++) {
                    const despesa = despesaCriada.data[index];
                    
                    currentList.push(despesa);
                }
                // Salva a lista atualizada com o novo item
                await this._saveToCache(cacheKey, currentList);
                console.log("[CACHE] Item inserido manualmente na lista local.");
            }

        } catch (e) {
            console.warn("Erro ao atualizar cache local (sem impacto pro usuário)", e);
        }

        return despesaCriada;
    }

   static getByRangeAndFamily =  async (params) => {
        const { familia_id, mes, ano } = params;
        const cacheKey = this._getCacheKey(familia_id, mes, ano);

        // 1. TENTA CACHE
        const localData = await this._getFromCache(cacheKey);
        if (localData) return localData;

        // 2. TENTA API
        const ENDPOINT = `${BASE_URL}/family?familia_id=${familia_id}&mes=${mes}&ano=${ano}`;
        
        try {
            const response = await authFetch(ENDPOINT, { method: 'GET' });
            if (!response.ok) return [];

            const data = await response.json();

            // 3. ATUALIZA CACHE
            await this._saveToCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error("Erro API - getByRange", error);
            return [];
        }
    }

    static getExpenseValues = async (params) => {
            try {
                const {  mes, ano } = params;
                // 1. Busca os dados (Local -> API)
                const data = await this.getByRangeAndFamily(params);
                
                // 2. Calcula totais básicos
                let monthlyCost = 0;
                data.forEach(expense => {
                    monthlyCost = secureSum(monthlyCost, expense.valor);
                });
                const expenseNum = data.length;

                // 3. Executa as novas análises
                //  evita que o Front-end tenha que fazer loops pesados
                const categoryData = this._analyzeCategories(data);
                const familyData = this._analyzeFamilySharing(data);
                const timeData = this._analyzeTimeFlow(data, monthlyCost,mes,ano);
                const futureDebt = this._analyzeFutureDebt(data);

                return {
                    // Dados originais
                    data,
                    monthlyCost,
                    expenseNum,
                    
                    // Novos dados processados
                    analytics: {
                        categories: categoryData, // Para o Gráfico de Rosca
                        family: familyData,       // Para o Ranking de quem gastou mais
                        flow: timeData,           // Para média diária e maior compra
                        futureDebt: futureDebt    // Valor total já comprometido nos próximos meses
                    },
                    
                    error: false
                };

            } catch (error) {
                console.error("Erro API - getExpenseValues", error);
                return {
                    data: [],
                    monthlyCost: 0,
                    expenseNum: 0,
                    analytics: {},
                    error: true
                };
            }
        }

    /**
     * Calcula gastos por categoria para gráficos (Donut/Pie Chart)
     * Retorna array ordenado: [{ name: "Lazer", value: 500, count: 2 }, ...]
     */
    static _analyzeCategories(data) {
        const categoryMap = {};

        data.forEach(item => {
            const cat = item.categoria || "Outros";
            if (!categoryMap[cat]) {
                categoryMap[cat] = { name: cat, value: 0, count: 0, color: "" }; // Color pode ser definido no front
            }
            categoryMap[cat].value = secureSum(categoryMap[cat].value, item.valor);
            categoryMap[cat].count += 1;
        });

        // Transforma em array e ordena do maior gasto para o menor
        return Object.values(categoryMap).sort((a, b) => b.value - a.value);
    }

    /**
     * Calcula gastos por Usuário da família (Ranking de gastos)
     * 
     */
    static _analyzeFamilySharing(data) {
        const userMap = {};

        data.forEach(item => {
            // Se userId for referência "/usuarios/ID", tentamos pegar só o ID ou usar o próprio
            // Aqui assumo que você pode ter um campo 'nomeUsuario' ou usa o ID mesmo
            const userKey = item.userId || "Desconhecido"; 
            
            if (!userMap[userKey]) {
                userMap[userKey] = { id: userKey, total: 0, count: 0 };
            }
            userMap[userKey].total = secureSum(userMap[userKey].total, item.valor);
            userMap[userKey].count += 1;
        });

        return Object.values(userMap).sort((a, b) => b.total - a.total);
    }


    /**
     * Analisa o fluxo temporal e projeção diária
     */
static _analyzeTimeFlow(data, totalMonthValue, mes, ano) {
    const today = new Date();

    const isCurrentMonth =
        today.getFullYear() === ano &&
        today.getMonth() + 1 === mes;

    const daysInMonth = new Date(ano, mes, 0).getDate();

    // Se for mês atual → dias já passados
    const daysElapsed = isCurrentMonth
        ? today.getDate()
        : daysInMonth;

    const dailyAverage = daysElapsed > 0
        ? totalMonthValue / daysElapsed
        : 0;

    const projectedTotal = isCurrentMonth
        ? dailyAverage * daysInMonth
        : totalMonthValue;

    // Maior despesa única
    const topExpense = data.reduce((prev, current) => {
        return (current.valor > prev.valor) ? current : prev;
    }, { valor: 0, descricao: "" });

    return {
        dailyAverage,
        projectedTotal,
        daysElapsed,
        daysInMonth,
        topExpense
    };
    
 
}

    /**
     * Calcula a "Bola de Neve" (Dívida futura baseada em parcelas restantes)
     * Olha para data.parcelaInfo
     */
    static _analyzeFutureDebt(data) {
        let totalRemainingDebt = 0;
        
        data.forEach(item => {
            if (item.tipo_desp === "parcelada" && item.parcelaInfo) {
                const current = Number(item.parcelaInfo.atual);
                const total = Number(item.parcelaInfo.total);

                if (!isNaN(current) && !isNaN(total) && total >= current) {
                    const remainingInstallments = total - current;
                    const debtValue = item.valor * remainingInstallments;
                    totalRemainingDebt += secureSum(totalRemainingDebt, debtValue);
                }
            }
        });

        return totalRemainingDebt;
    }

}
//export const Expense = { create:createExpense,getByRangeAndFaml:getExpensesByFamily}