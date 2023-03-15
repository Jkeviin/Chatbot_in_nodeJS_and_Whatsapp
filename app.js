const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const WebWhatsappProvider = require('@bot-whatsapp/provider/baileys')
const MongoDBAdapter = require('@bot-whatsapp/database-mongodb') // importa el adaptador de MongoDB

// DELAY:
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const flowSaludo = addKeyword(['hola', 'ole', 'alo'])
    .addAnswer(['Hola, bienvenido a mi tienda', '¿Como puedo ayudarte?'])
    .addAnswer(['Tengo:', 'Zapatos', 'Bolsos', 'etc ...'])


let nombre;
let apellidos;
let telefono;

const flowFormulario = addKeyword(['prueba','⬅️ Volver al Inicio'])
    .addAnswer(
        ['Hola!','Para enviar el formulario necesito unos datos...' ,'Escriba su *Nombre*'],
        { capture: true, buttons: [{ body: '❌ Cancelar solicitud' }] },

        async (ctx, { flowDynamic, endFlow }) => {
            if (ctx.body == '❌ Cancelar solicitud')
             return endFlow({body: '❌ Su solicitud ha sido cancelada ❌',    // Aquí terminamos el flow si la condicion se comple
                 buttons:[{body:'⬅️ Volver al Inicio' }]                      // Y además, añadimos un botón por si necesitas derivarlo a otro flow

            })
            nombre = ctx.body
            return flowDynamic(`Encantado *${nombre}*, continuamos...`)
        }
    )
    .addAnswer(
        ['También necesito tus dos apellidos'],
        { capture: true, buttons: [{ body: '❌ Cancelar solicitud' }] },

        async (ctx, { flowDynamic, endFlow }) => {
            if (ctx.body == '❌ Cancelar solicitud') 
                return endFlow({body: '❌ Su solicitud ha sido cancelada ❌',
                    buttons:[{body:'⬅️ Volver al Inicio' }]


        })
        apellidos = ctx.body
        return flowDynamic(`Perfecto *${nombre}*, por último...`)
        }
    )
    .addAnswer(
        ['Dejeme su número de teléfono y le llamaré lo antes posible.'],
        { capture: true, buttons: [{ body: '❌ Cancelar solicitud' }] },

        async (ctx, { flowDynamic, endFlow }) => {
            if (ctx.body == '❌ Cancelar solicitud') 
                return endFlow({body: '❌ Su solicitud ha sido cancelada ❌',
                      buttons:[{body:'⬅️ Volver al Inicio' }]
                })


                telefono = ctx.body
                await delay(2000)
                return flowDynamic(`Estupendo *${nombre}*! te dejo el resumen de tu formulario
                \n- Nombre y apellidos: *${nombre} ${apellidos}*
                \n- Telefono: *${telefono}*`)
        }
    )

    const flowRetraso = addKeyword('retraso').addAnswer('Este mensaje se enviara 5 segundo despues', {
        delay: 5000,
    })

    const flowImagen = addKeyword('imagen').addAnswer('Este mensaje envia una imagen', {
        media: 'https://ichef.bbci.co.uk/news/640/amz/worldservice/live/assets/images/2015/06/30/150630113156_concurso_perros_feos_624x351_getty.jpg',
    })

    const flowBotones = addKeyword('botones').addAnswer('Este mensaje envia tres botones', {
        buttons: [{ body: 'Boton 1' }, { body: 'Boton 2' }, { body: 'Boton 3' }],
    })
    

    const flowArgumento = addKeyword('argumento').addAnswer('Indica cual es tu email', null, (ctx) => {
        console.log('👉 Informacion del contexto: ', ctx)
    })

    const flowCorreo = addKeyword('correo').addAnswer('Indica cual es tu email', null, (ctx, { fallback }) => {
        if (!ctx.body.includes('@')) {
            return fallback('El email no es correcto, por favor, indica un email valido')
        }
    })

/**
 * Esta es la funcion importante es la que realmente inicia
 * el chatbot.
 */
const main = async () => {
    const adapterDB = new MongoDBAdapter({ url: 'mongodb://localhost:27017/my-database' }) // crea una instancia de MongoDBAdapter
    const adapterFlow = createFlow([flowSaludo, flowFormulario, flowRetraso, flowImagen, flowBotones, flowArgumento, flowCorreo])
    const adapterProvider = createProvider(WebWhatsappProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    },
        {
            blackList: ['xxx'],
        })

    try {
        const prevMsg = undefined // o reemplazar por un valor predeterminado
        const message = undefined // o reemplazar por un valor predeterminado
        const answer = typeof message === 'string' ? message : (message?.body !== undefined ? message.body : prevMsg?.answer)
        // Usa la variable 'answer' en el código que sigue...
    } catch (error) {
        console.error(error)
    }
}

main()
