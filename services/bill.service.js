const config = require('../config/variables')
const Log = require('../models/Logs')
const axios = require('axios')
const User = require('../models/user')
const Transaction = require('../models/Transactions')
const webhook = require('../models/webHook')
const WalletUtils = require('../utils/wallet')


class BillService {
    getConfig = async (payload)=>{
        try{
            const{requestType, basic} = payload
            let configParams = {}

            if (requestType === "post"){
                configParams = {
                    "api-key": config.Vt_pass_API_KEY,
                    "secret-key": config.Vt_pass_SECRET_KEY
                }
            }
            if (requestType === "get"){
                configParams = {
                    "api-key": config.Vt_pass_API_KEY,
                    "public-key": config.Vt_pass_SECRET_KEY
                }
            }
            if(basic){
                const clientSecret = Buffer.from(
                    `${config.Vt_pass_USERNAME}:${config.Vt_pass_PASSWORD}`)
                     .toString('base64')

                     configParams = {
                        Authorization: `Basic ${clientSecret}`
            }
            return {
                status: "success",
                message: "config retrieved successfully",
                data: {config:configParams}
                }
            }
        }catch (error){
            console.log(error)
            return{
                status: "failed",
                message: "request failed"
            }
        }
    }
    buyAirtime = async (payload) =>{
        const getConfigRes = await this.getConfig({requestType:'post'})
        if(getConfigRes == 'failed'){
            return {
                status :'failed',
                message : 'Request failed,try again later'
            }
        }
        const url = `${config.VT_PASS_BASE_URL}/api/pay`
        const requestConfig = getConfigRes?.data.config
        headers = {
            ...requestConfig
        }

        const {amount,phone,serviceId, reference} = payload
        let requestPayload = {
            amount: amount,
            phone,
            request_id : reference,
            serviceID: serviceId
        }

        try{
            let axiosConfig = {headers}
            const{data} = await axios.post(url,axiosConfig, requestPayload)

            Log.create({
                service: "vtpass",
                httpMethod: "post",
                url,
                request: JSON.stringify(requestPayload),
                response: JSON.stringify(data),
                headers: JSON.stringify(headers),
                status: data?.code === "000" ? "success" : "failed"
            })
            if (data?.code !== '000' || data?.content?.error){
                return {
                    status :'failed',
                    message : data?.content?.error || "Request failed,try again later"
                }
            }
            return {
                status: "success",
                message: "Airtime Purchased successfully",
                data: data
            }
        }catch (error){
            console.log(error)
            const errMsg = error.response?.data
                ? error.response?.data.message
                :error.message

            Log.create({
                service: "vtpass",
                httpMethod: "post",
                url,
                request: JSON.stringify(requestPayload),
                response: error.response?.data
                    ? JSON.stringify(error.response?.data)
                    : errMsg,
                headers: JSON.stringify(headers),
                status: "failed"
            })
            return{
                status: "failed",
                message: "request Failed"
            }
        }

    }

    getVariationCode = async (payload) =>{
        const getConfigRes = await this.getConfig({requestType:'get'})
        if(getConfigRes.status === 'failed'){
            return{
                status: "failed",
                message: "Request failed, try later"
            }
        }
        const url = `${config.VT_PASS_BASE_URL}/api/service-variations`
        const requestConfig = getConfigRes?.data?.config
        const headers = {...requestConfig}

        const {serviceId} = payload
        let requestPayload = {serviceID: serviceId}

        try{
            let axiosConfig = {
                headers,
                params: requestPayload}
            const {data} = await axios.get(url, axiosConfig)

            Log.create({
                service: "vtPass",
                httpMethod: "get",
                url,
                request: JSON.stringify(requestPayload),
                headers: JSON.stringify(headers),
                response: JSON.stringify(data),
                status: data?.response_description === "000" ? "success" : "failed",
            });
            if (data?.response_description !== "000"){
                return{
                    status :"failed",
                    message: "Request failed to complete, try again later",
                }
            }
            return {
                status: "success",
                message : "Variation code fetched successfully",
                data : data?.content || data
            }

        }catch (error){
            console.log(error)
            errMsg = error.response?.data
                ? error.response?.data?.message
                :error.message

            Log.create({
                service: "vtPass",
                httpMethod: "get",
                url,
                request: JSON.stringify(requestPayload),
                headers: JSON.stringify(headers),
                response: error.response?.data
                    ? JSON.stringify(error.response?.data)
                    : errMsg,
                status: "failed",
            });
            return {
                status: "failed",
                message: "Request failed",
            };
        }
    }

    butData = async (payload) =>{
        const getConfigRes = await this.getConfig({
            requestType : 'post',
            basic: 
                payload?.serviceId === 'smile-direct' ||  "spectranet"
                    ? true
                    : undefined
        })
        if (getConfigRes.status ==="failed"){
            return{
                status:"failed",
                message: "Request failed, try again later"
            }
        }
        const url = `${config.VT_PASS_BASE_URL}/api/pay`
        const requestConfig = getConfigRes?.data?.config
        headers = {...requestConfig}

        const {
            serviceId,
            phone,
            amount,
            reference,
            billersCode,
            variationCode,
            quantity,
        } = payload;
        
        let requestPayload = {
            request_id: reference,
            serviceID: serviceId,
            billersCode,
            variation_code: variationCode,
            amount: amount,
            phone,
            quantity: serviceId === "spectranet" ? quantity : undefined,
          
        }

        try{
            axiosConfig = {headers}
            const {data} = await axios.post(url,axiosConfig,requestPayload)

            Log.create({
                service: "vtPass",
                httpMethod: "post",
                url,
                request: JSON.stringify(requestPayload),
                headers: JSON.stringify(headers),
                response: JSON.stringify(data),
                status: data?.code === "000" ? "success" : "failed",
            });
            if (data?.code !== "000" || data?.content?.error) {
                return {
                  status: "failed",
                  message: data?.content?.error || "Request failed to complete, try again later",
                };
            }
            return {
                status :'success',
                message : "Data purchased successfully ",
                data: data
            }

        }catch (error) {
            console.log(error);
            const errMsg = error.response?.data
              ? error.response?.data?.message
              : error.message;
      
        Log.create({
            service: "vtPass",
            httpMethod: "post",
            url,
            request: JSON.stringify(requestPayload),
            headers: JSON.stringify(headers),
            response: error.response?.data
                ? JSON.stringify(error.response?.data)
                : errMsg,
            status: "failed",
            });
        return {
            status: "failed",
            message: "Request failed",
        } 
        };
    }

    verifySmileEmail = async(payload) =>{
        const getConfigRes = await this.getConfig({requestType:'post'})
        if (getConfigRes.status === "failed"){
            return {
                status:'failed',
                message: "Request failed, try again later"
            }
        }

        const url = `${config.VT_PASS_BASE_URL}/api/merchant-verify/smile/email`
        const requestConfig = getconfigRes.data?.config
        const headers = {...requestConfig}

        const {billersCode, serviceId} = payload
        let requestPayload = {
            serviceID :serviceId,
            billersCode,
        }
        try{
            const axiosConfig = {headers}
            const {data} = await axios.post(url,requestPayload,axiosConfig)

            Log.create({
                service: "vtPass",
                httpMethod: "post",
                url,
                request: JSON.stringify(requestPayload),
                headers: JSON.stringify(headers),
                response: JSON.stringify(data),
                status: data?.code === "000" ? "success" : "failed",
            });

            if(data?.code !== '000' ||data?.content?.error){
                return {
                    status : 'failed',
                    message : data?.content?.error || "Request failed to complete,try again later"
                }
            }
            return {
                status: "success",
                message :'email verified successfully',
                data : data?.content || data
            }
        }catch (error){
            console.log(error)
            errMsg = error.response?.data
                ? error.response?.data?.message
                : error.message
            
            Log.create({
                service: "vtPass",
                httpMethod: "post",
                url,
                request: JSON.stringify(requestPayload),
                headers: JSON.stringify(headers),
                response: error.response?.data
                    ? JSON.stringify(error.response?.data)
                    : errMsg,
                status: "failed",
            });
            return {
                status: "failed",
                message: "Request failed",
            }
                
        }

    }
    payTvSuscription =async(payload)=>{
        const getConfigRes = await this.getConfig({
            requestType:"post",
            basic: payload?.serviceId === "dstv" ? true : undefined})

        if (getConfigRes.status === 'failed'){
            return {
                status: 'failed',
                message: "Request failed, try again later"
            }
        }
        const url = `${config.VT_PASS_BASE_URL}/api/pay`
        const requestConfig = getconfigRes?.data?.config
        const headers = {...requestConfig}

        const {
            serviceId,
            phone,
            amount,
            reference,
            variationCode,
            quantity,
            subscriptionType,
            billersCode

        } = payload

        let requestPayload = {
            request_id: reference,
            phone,
            amount,
            serviceID : serviceId,
            subscription_type: subscriptionType,
            quantity,
            billersCode,
            variation_code :variationCode

        }
        try{
            const axiosConfig = {headers}
            const {data} = await axios.post(url,requestPayload,axiosConfig)

            Log.create({
                service: "vtPass",
                httpMethod: "post",
                url,
                request: JSON.stringify(requestPayload),
                headers: JSON.stringify(headers),
                response: JSON.stringify(data),
                status: data?.code === "000" ? "success" : "failed",
            });
            if (data?.code !== '000' ||data?.content?.error){
                return {
                    status: "failed",
                    message: data?.code?.error || "Request failed,try again later"
                }
            }
            return{
                status: "success",
                message: "TV Suscription Purchased succsssfully ",
                data : data
            }
        }catch (error){
            console.log(error)
            errMsg  = error.response?.data
                ?error.response?.data?.message
                : error.message

            Log.create({
                service: "vtPass",
                httpMethod: "post",
                url,
                request: JSON.stringify(requestPayload),
                headers: JSON.stringify(headers),
                response: error.response?.data
                    ? JSON.stringify(error.response?.data)
                    :errMsg,
                status:"failed",
            });
            return{
                status:'failed',
                message: "Request failed,try again later"
            }
        }
    }

    verifySmartCardNumber = async (payload) => {
        const getConfigRes = await this.getConfig({ requestType: "post" });
        if (getConfigRes.status === "failed") {
          return {
            status: "failed",
            message: "Request failed, try again later",
          };
        }
    
        const url = `${config.VT_PASS_BASE_URL}/api/merchant-verify`;
        const requestConfig = getConfigRes?.data?.config;
        const headers = {
          ...requestConfig,
        };
    
        const   { serviceId, billersCode } = payload;
    
        let requestPayload = {
          serviceID: serviceId,
          billersCode,
        };
    
        try {
          let axiosConfig = {
            headers,
          };
          const { data } = await axios.post(`${url}`, requestPayload, axiosConfig);
    
          Log.create({
            service: "vtPass",
            httpMethod: "post",
            url,
            request: JSON.stringify(requestPayload),
            headers: JSON.stringify(headers),
            response: JSON.stringify(data),
            status: data?.code === "000" ? "success" : "failed",
          });
    
          if (data?.code !== "000" || data?.content?.error) {
            return {
              status: "failed",
              message: data?.content?.error || "Request failed to complete, try again later",
            };
          }
    
          return {
            status: "success",
            message: "Smart card number verified successfully",
            data: data?.content || data,
          };
        }catch (error) {
          console.log(error);
          const errMsg = error.response?.data
            ? error.response?.data?.message
            : error.message;
    
        Log.create({
            service: "vtPass",
            httpMethod: "post",
            url,
            request: JSON.stringify(requestPayload),
            headers: JSON.stringify(headers),
            response: error.response?.data
              ? JSON.stringify(error.response?.data)
              : errMsg,
            status: "failed",
        });
        return {
            status: "failed",
            message: "Request failed",
          };
        }
    };
    
    payElectricityBill = async (payload) => {
        const getConfigRes = await this.getConfig({
          requestType: "post"
        });
        if (getConfigRes.status === "failed") {
          return {
            status: "failed",
            message: "Request failed, try again later",
          };
        }
    
        const url = `${config.VT_PASS_BASE_URL}/api/pay`;
        const requestConfig = getConfigRes?.data?.config;
        const headers = {
          ...requestConfig,
        };
    
        const {
          serviceId,
          phone,
          amount,
          reference,
          billersCode,
          variationCode,
        } = payload;
    
        let requestPayload = {
          request_id: reference,
          serviceID: serviceId,
          billersCode,
          variation_code: variationCode,
          amount: amount,
          phone,
        };
    
        try {
          let axiosConfig = {
            headers,
          };
          const { data } = await axios.post(url, requestPayload, axiosConfig);
    
          Log.create({
            service: "vtPass",
            httpMethod: "post",
            url,
            request: JSON.stringify(requestPayload),
            headers: JSON.stringify(headers),
            response: JSON.stringify(data),
            status: data?.code === "000" ? "success" : "failed",
          });
    
          if (data?.code !== "000") {
            return {
              status: "failed",
              message: "Request failed to complete, try again later",
            };
          }
    
          return {
            status: "success",
            message: "Electricity purchased successfully",
            data: data,
          };
        } catch (error) {
          console.log(error);
          const errMsg = error.response?.data
            ? error.response?.data?.message
            : error.message;
    
        Log.create({
            service: "vtPass",
            httpMethod: "post",
            url,
            request: JSON.stringify(requestPayload),
            headers: JSON.stringify(headers),
            response: error.response?.data
              ? JSON.stringify(error.response?.data)
              : errMsg,
            status: "failed",
         });
        return {
            status: "failed",
            message: "Request failed",
          };
        }
    };
    verifyMeterNumber = async (payload) => {
        const getConfigRes = await this.getConfig({ requestType: "post" });
        if (getConfigRes.status === "failed") {
          return {
            status: "failed",
            message: "Request failed, try again later",
          };
        }
    
        const url = `${config.VT_PASS_BASE_URL}/api/merchant-verify`;
        const requestConfig = getConfigRes?.data?.config;
        const headers = {
          ...requestConfig,
        };
    
        const { serviceId, billersCode, type } = payload;
    
        let requestPayload = {
          serviceID: serviceId,
          billersCode,
          type,
        };
    
        try {
          let axiosConfig = {
            headers,
          };
          const { data } = await axios.post(`${url}`, requestPayload, axiosConfig);
    
          Log.create({
            service: "vtPass",
            httpMethod: "post",
            url,
            request: JSON.stringify(requestPayload),
            headers: JSON.stringify(headers),
            response: JSON.stringify(data),
            status: data?.code === "000" ? "success" : "failed",
          });
    
          if (data?.code !== "000" || data?.content?.error) {
            return {
              status: "failed",
              message: data?.content?.error || "Request failed to complete, try again later",
            };
          }
    
          return {
            status: "success",
            message: "Smart card number verified successfully",
            data: data?.content || data,
          };
        } catch (error) {
          console.log(error);
          const errMsg = error.response?.data
            ? error.response?.data?.message
            : error.message;
    
          Log.create({
            service: "vtPass",
            httpMethod: "post",
            url,
            request: JSON.stringify(requestPayload),
            headers: JSON.stringify(headers),
            response: error.response?.data
              ? JSON.stringify(error.response?.data)
              : errMsg,
            status: "failed",
          });
          return {
            status: "failed",
            message: "Request failed",
          };
        }
    };
    payEducationalBill = async (payload) => {
        const getConfigRes = await this.getConfig({
          requestType: "post",
        });
        if (getConfigRes.status === "failed") {
          return {
            status: "failed",
            message: "Request failed, try again later",
          };
        }
    
        const url = `${config.VT_PASS_BASE_URL}/api/pay`;
        const requestConfig = getConfigRes?.data?.config;
        const headers = {
          ...requestConfig,
        };
    
        const {
          serviceId,
          phone,
          amount,
          reference,
          variationCode,
          quantity,
          billersCode,
        } = payload;
    
        let requestPayload = {
          request_id: reference,
          serviceID: serviceId,
          billersCode: serviceId == "jamb" ? billersCode : undefined,
          variation_code: variationCode,
          amount: amount,
          phone,
          quantity,
        };
    
        try {
          let axiosConfig = {
            headers,
          };
          const { data } = await axios.post(url, requestPayload, axiosConfig);
    
          Log.create({
            service: "vtPass",
            httpMethod: "post",
            url,
            request: JSON.stringify(requestPayload),
            headers: JSON.stringify(headers),
            response: JSON.stringify(data),
            status: data?.code === "000" ? "success" : "failed",
          });
    
          if (data?.code !== "000") {
            return {
              status: "failed",
              message: "Request failed to complete, try again later",
            };
          }
    
          return {
            status: "success",
            message: "Data purchased successfully",
            data: data,
          };
        } catch (error) {
          console.log(error);
          const errMsg = error.response?.data
            ? error.response?.data?.message
            : error.message;
    
          Log.create({
            service: "vtPass",
            httpMethod: "post",
            url,
            request: JSON.stringify(requestPayload),
            headers: JSON.stringify(headers),
            response: error.response?.data
              ? JSON.stringify(error.response?.data)
              : errMsg,
            status: "failed",
          });
          return {
            status: "failed",
            message: "Request failed",
          };
        }
    }

    verifyProfileId = async (payload) =>{
        const getConfigRes = await this.getConfig({requestType:'post'})
        if(getConfigRes.status === 'failed'){
            return {
                status: "failed",
                message: "Request Failed, try again later"
            }
        }
        const url = `${config.VT_PASS_BASE_URL}/api/merchant-verify`
        const requestConfig = getConfigRes?.data?.config
        const headers = {...requestConfig}


        const {
            billersCode,
            serviceId,
            type
        } = payload

        let requestPayload = {
            billersCode,
            serviceID:serviceId,
            type
        }
        try{
            let axiosConfig = {headers}
            const {data} = await axios.post(url, requestPayload, axiosConfig)

            Log.create({
                service: "vtPass",
                httpMethod: "post",
                url,
                request: JSON.stringify(requestPayload),
                headers: JSON.stringify(headers),
                response: JSON.stringify(data),
                status: data?.code === "000" ? "success" : "failed",
            });

            if (data?.code !== "000" || data?.content?.error) {
                return {
                  status: "failed",
                  message: data?.content?.error || "Request failed to complete, try again later",
                };
            }
        
            return {
                status: "success",
                message: "Profile Id verified successfully",
                data: data?.content || data,
            };
        }catch (error){
            console.log(error)
                const errMsg = error.response?.data
                    ?error.response?.data?.message
                    :error.message

            Log.create({
                service: "vtPass",
                httpMethod: "post",
                url,
                request: JSON.stringify(requestPayload),
                headers: JSON.stringify(headers),
                response: error.response?.data
                    ? JSON.stringify(error.response?.data)
                    : errMsg,
                status: "failed",
            })
            return {
                status: 'failed',
                message: "Request failed"
            }
        }
    }
    payInsuranceBill = async(payload)=>{
        const getConfigRes = await this.getConfig({
            requestType: "post",
            basic: payload?.serviceId === "ui-insure" || payload?.serviceId ==="health-insurance-rhl" ? true :undefined
        })
        if(getConfigRes.status === 'failed'){
            return{
                status : 'failed',
                message : 'Request failed, try again later'
            }
        }
        const url = `${config.VT_PASS_BASE_URL}/api/pay`;
        const requestConfig = getConfigRes?.data?.config;
        const headers = {
            ...requestConfig,
        };

        const {
            serviceId,
            phone,
            amount,
            reference,
            variationCode,
            billersCode,
            issuedName,
            chasisNumber,
            plateNumber,
            vehicleMake,
            vehicleColor,
            vehicleModel,
            yearOfMake,
            fullName,
            buildingType,
            address,
            engineCapacity,
            selectedHospital,
            passportPhoto,
            dateOfBirth,
            extraInfo,
            nextKinName,
            nextKinPhone,
            businessOccupation,
            email
        } = payload;

    
        let requestPayload = {
            request_id: reference,
            serviceID: serviceId,
            billersCode,
            variation_code: variationCode,
            amount,
            phone,
            full_name: serviceId === "personal-accident-insurance" || serviceId === "home-cover-insurance" ? fullName : undefined,
            address: serviceId === "personal-accident-insurance" || serviceId === "home-cover-insurance" || serviceId=== "health-insurance-rhl" ? address : undefined,
            dob: serviceId === "personal-accident-insurance" || serviceId === "home-cover-insurance" || serviceId ==="health-insurance-rhl" ? dateOfBirth : undefined,
            next_kin_name: serviceId === "personal-accident-insurance" ? nextKinName : undefined,
            next_kin_phone: serviceId === "personal-accident-insurance" ? nextKinPhone : undefined,
            business_occupation: serviceId === "personal-accident-insurance" || serviceId === "home-cover-insurance" ? businessOccupation : undefined,
            selected_hospital: serviceId === "health-insurance-rhl" ? selectedHospital : undefined,
            Passport_Photo: serviceId === "health-insurance-rhl" ? passportPhoto : undefined,
            date_of_birth: serviceId === "health-insurance-rhl" || serviceId === "home-cover-insurance" ? dateOfBirth : undefined,
            extra_info: serviceId === "health-insurance-rhl" ? extraInfo : undefined,
            engine_capacity: serviceId === "ui-insure" ? engineCapacity : undefined,
            Chasis_Number: serviceId === "ui-insure" ? chasisNumber : undefined,
            Plate_Number: serviceId === "ui-insure" ? plateNumber : undefined,
            vehicle_make: serviceId === "ui-insure" ? vehicleMake : undefined,
            vehicle_color: serviceId === "ui-insure" ? vehicleColor : undefined,
            vehicle_model: serviceId === "ui-insure" ? vehicleModel : undefined,
            YearofMake: serviceId === "ui-insure" ? yearOfMake : undefined,
            state: serviceId === "ui-insure" ? state : undefined,
            lga: serviceId === "ui-insure" ? lga : undefined,
            Insured_Name: serviceId === "ui-insure" ? issuedName : undefined,
            type_building: serviceId ==="home-cover-insurance" ? buildingType : undefined,
            email: serviceId ==="ui-insure" ? email :undefined
            
        };
        try {
            let axiosConfig = {
              headers,
            };
            const { data } = await axios.post(url, requestPayload, axiosConfig);
      
            Log.create({
              service: "vtPass",
              httpMethod: "post",
              url,
              request: JSON.stringify(requestPayload),
              headers: JSON.stringify(headers),
              response: JSON.stringify(data),
              status: data?.code === "000" ? "success" : "failed",
            });
      
            if (data?.code !== "000") {
              return {
                status: "failed",
                message: "Request failed to complete, try again later",
              };
            }
      
            return {
              status: "success",
              message: "Insurance billed payed successfully",
              data: data,
            };
        } catch (error) {
            console.log(error);
            const errMsg = error.response?.data
              ? error.response?.data?.message
              : error.message;
      
            Log.create({
              service: "vtPass",
              httpMethod: "post",
              url,
              request: JSON.stringify(requestPayload),
              headers: JSON.stringify(headers),
              response: error.response?.data
                ? JSON.stringify(error.response?.data)
                : errMsg,
              status: "failed",
            });
            return {
              status: "failed",
              message: "Request failed",
            };
        }
    };
    getExtraFields = async (payload)=>{
        const getConfigRes = await this.getConfig({requestType:"get"})
        if (getConfigRes.status ==='failed'){
            return {
                status:'failed',
                message: "Request failed, try again later"
            }
        }

        const url =`${config.VT_PASS_BASE_URL}/api/extra-fields`
        const requestConfig = getConfigRes?.data?.config
        const headers = {...requestConfig}

        const {serviceId} = payload

        let requestPayload = {
            serviceID : serviceId, 
        }

        try {
            let axiosConfig = {
              headers,
            };
            const { data } = await axios.get(
              `${url}?serviceID=${serviceId}`,
              axiosConfig
            );
      
            Log.create({
              service: "vtPass",
              httpMethod: "get",
              url,
              request: JSON.stringify(requestPayload),
              headers: JSON.stringify(headers),
              response: JSON.stringify(data),
              status: data?.code === "000" ? "success" : "failed",
            });
      
            if (data?.code !== "000") {
              return {
                status: "failed",
                message: "Request failed to complete, try again later",
              };
            }
      
            return {
              status: "success",
              message: "Extra fields fetched successfully",
              data: data?.content || data,
            };
        } catch (error) {
            console.log(error);
            const errMsg = error.response?.data
              ? error.response?.data?.message
              : error.message;
      
            Log.create({
              service: "vtPass",
              httpMethod: "get",
              url,
              request: JSON.stringify(requestPayload),
              headers: JSON.stringify(headers),
              response: error.response?.data
                ? JSON.stringify(error.response?.data)
                : errMsg,
              status: "failed",
            });
            return {
              status: "failed",
              message: "Request failed",
            };
        }
    }
    getOptions = async (payload) => {
        const getConfigRes = await this.getConfig({ requestType: "get" });
        if (getConfigRes.status === "failed") {
          return {
            status: "failed",
            message: "Request failed, try again later",
          };
        }
    
        const url = `${config.VT_PASS_BASE_URL}/api/options`;
        const requestConfig = getConfigRes?.data?.config;
        const headers = {
          ...requestConfig,
        };
    
        const { serviceId, name } = payload;
    
        let requestPayload = {
          serviceID: serviceId,
        };
    
        try {
          let axiosConfig = {
            headers,
          };
          const { data } = await axios.get(
            `${url}?serviceID=${serviceId}&name=${name}`,
            axiosConfig
          );
    
          Log.create({
            service: "vtPass",
            httpMethod: "get",
            url,
            request: JSON.stringify(requestPayload),
            headers: JSON.stringify(headers),
            response: JSON.stringify(data),
            status: data?.code === "000" ? "success" : "failed",
          });
    
          if (data?.code !== "000") {
            return {
              status: "failed",
              message: "Request failed to complete, try again later",
            };
          }
    
          return {
            status: "success",
            message: "Options fetched successfully",
            data: data?.content || data,
          };
        } catch (error) {
          console.log(error);
          const errMsg = error.response?.data
            ? error.response?.data?.message
            : error.message;
    
          Log.create({
            service: "vtPass",
            httpMethod: "get",
            url,
            request: JSON.stringify(requestPayload),
            headers: JSON.stringify(headers),
            response: error.response?.data
              ? JSON.stringify(error.response?.data)
              : errMsg,
            status: "failed",
          });
          return {
            status: "failed",
            message: "Request failed",
          };
        }
    };
    reQueryTransaction = async (payload) => {
        const getConfigRes = await this.getConfig({ requestType: "post" });
        if (getConfigRes.status === "failed") {
          return {
            status: "failed",
            message: "Request failed, try again later",
          };
        }
    
        const url = `${config.VT_PASS_BASE_URL}/api/requery`;
        const requestConfig = getConfigRes?.data?.config;
        const headers = {
          ...requestConfig,
        };
    
        const { requestId } = payload;
    
        let requestPayload = {
          request_id: requestId,
        };
    
        try {
          let axiosConfig = {
            headers,
          };
          const { data } = await axios.post(`${url}`, requestPayload, axiosConfig);
    
          Log.create({
            service: "vtPass",
            httpMethod: "post",
            url,
            request: JSON.stringify(requestPayload),
            headers: JSON.stringify(headers),
            response: JSON.stringify(data),
            status: data?.code === "000" ? "success" : "failed",
          });
    
          if (data?.code !== "000") {
            return {
              status: "failed",
              message: "Request failed to complete, try again later",
            };
          }
    
          return {
            status: "success",
            message: "Transaction re-queried successfully",
            data: data?.content || data,
          };
        } catch (error) {
          console.log(error);
          const errMsg = error.response?.data
            ? error.response?.data?.message
            : error.message;
    
          Log.create({
            service: "vtPass",
            httpMethod: "post",
            url,
            request: JSON.stringify(requestPayload),
            headers: JSON.stringify(headers),
            response: error.response?.data
              ? JSON.stringify(error.response?.data)
              : errMsg,
            status: "failed",
          });
          return {
            status: "failed",
            message: "Request failed",
          };
        }
    };
    
    saveWebhookEvents = async (payload) => {
        try {
          const { service, headers, body, query } = payload;
    
          const newWebhookEventPayload = {
            service: service.toLowerCase(),
            uniqueReference: body?.eventData?.transactionReference,
            headers: JSON.stringify(headers || {}),
            requestBody: JSON.stringify(body || {}),
            requestQuery: JSON.stringify(query || {}),
          };
    
          await webhook.create(newWebhookEventPayload);
    
          return {
            status: "success",
            message: "webhook event saved successfully",
          };
        } catch (error) {
          console.log(error);
          return {
            status: "failed",
            message: "Request failed",
          };
        }
    };

    processTransactionUpdateEvent =async(payload)=>{
        try{
            const{data:eventData} = payload
            if (!eventData){
                return{
                    status: "failed",
                    message: "eventData is missing"
                }
            }
            const reference = eventData?.requestId
            const paymentStatus = eventData?.content?.transactions?.status

            //check for duplicates

            const transactionExist = await Transaction.findOne({
                $or:[{externalReference:reference}, {reference}]
            })
            if (!transactionExist) {
                return {
                  status: "failed",
                  message: "Invalid transaction",
                };
            }

            if (transactionExist.status === "successful" &&
                (paymentStatus === "successful" ||paymentStatus === "delivered")){
                    return {
                        status :'success',
                        message: "Transaction already processed"
                    }
            }

            //Check if user exist
            const userId = transactionExist.user
            const userExists = await User.findOne({_id:userId})
             
            if(!userExists){
                return{
                    status: 'failed',
                    message: "user does not exist"
                }
            }
            if (transactionExist.status === "failed" &&
                (paymentStatus === "failed" || paymentStatus === "reversed")) {
                  return {
                    status: "failed",
                    message: "Transaction already processed",
                    };
                }
                await Transaction.updateOne(
                { _id: transactionExist._id },
                { status: "failed" });

                 //wallet credit 
                const walletCreditRes = await WalletUtils.creditWallet({
                    userId: userExists._id,
                    amount: Number(transactionExist.amount),
                    source: "bill-payment-reversal",
                })
                if (walletCreditRes.status =="failed"){
                    return{
                        status: 'failed',
                        message:walletCreditRes?.message || "failed to credit wallet"
                    }
            }
            return {
                status: "success",
                message: "Bill payment event processed successfully"
            }


        }catch (error){
            console.log(error)
            return{
                status: "failed",
                message :'Request  failed'
            }
        }

    }

    handleWebhookEvents = async (payload) => {
        try {
          const { body, headers, query } = payload;
    
          const eventType = body?.type;
    
          //check for unique reference to prevent duplicate
          const uniqueReference = body?.data?.requestId;
          if (uniqueReference) {
            const alreadySavedWebhook = await webhook.findOne({
              service: "vtPass",
              uniqueReference: body?.eventData?.transactionReference,
            });
    
            if (alreadySavedWebhook) {
              //save for record purpose
              this.saveWebhookEvents({ body, headers, query, service: "vtPass" });
              return {
                status: "failed",
                message: "Webhook has already been received",
              };
            }
          }
    
          //save eventbefore processing
          await saveWebhookEvents({ body, headers, query, service: "vtPass" });
    
          let processRes = {
            status: "success",
            message: "Processed",
          };
          // Handle specific event types
          if (eventType.toLowerCase() === "transaction-update") {
            processRes = await processTransactionsUpdateEvent(body);
          }
    
          if (eventType.toLowerCase() === "variations-update") {
          }
    
          return {
            status: processRes?.status || "success",
            message: processRes?.message || "Processed",
          };
        } catch (error) {
          console.log(error);
          return {
            status: "failed",
            message: "Request failed",
          };
        }
    };

}
module.exports = new BillService()
    
    


    
