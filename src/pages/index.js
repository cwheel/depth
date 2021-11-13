import './global.css'

import * as React from 'react'
import { Helmet } from 'react-helmet'
import styled from '@emotion/styled';

import { planOC, planCCR } from '../planner';

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;

    margin-left: 50px;
    margin-right: 50px;
    margin-top: 50px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;

    input {
        margin-bottom: 10px;
    }

    select {
        margin-bottom: 10px;
    }

    button {
        margin-top: 30px;
    }
`;

const Disclaimer = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    height: auto;
    width: auto;

    padding: 50px;

    background: white;
`;

const RejectButton = styled.button`
    background: #f1f1f1;
    margin-left: 10px;
`;

const IndexPage = () => {
    const [form, updateForm] = React.useReducer((currentFields, event) => {
        const newForm = {
            ...currentFields,
            [event.target.name]: event.target.type === 'number' ? parseFloat(event.target.value) : event.target.value
        };

        localStorage.setItem('form', JSON.stringify(newForm));
        return newForm;
    }, {
        mode: 'ccr',
        salinity: 'fresh'
    });

    const [result, setResult] = React.useState('');
    const [showDisclaimer, setShowDisclaimer] = React.useState(false);

    React.useEffect(() => {
        const formState = JSON.parse(window.localStorage.getItem('form'));
        setShowDisclaimer(window.localStorage.getItem('showDisclaimer') !== "false");

        if (formState) {
            Object.keys(formState).map(field => updateForm({
                target: {
                    name: field,
                    value: formState[field],
                }
            }));
        }
    }, []);

    const hideDisclaimer = () => {
        setShowDisclaimer(false);
        window.localStorage.setItem('showDisclaimer', false);
    }

    const calculate = () => {
        if (form.mode === 'oc') {
            setResult(planOC(form));
        } else if (form.mode === 'ccr') {
            setResult(planCCR(form));
        }
    };

    return (
        <>
            <Helmet>
                <title>Depth: Gas Planner</title>
            </Helmet>

            {showDisclaimer && <Disclaimer>
                <h1>Depth Disclaimer</h1>
                <p>Calculations made with Depth should not be relied upon and no guarantees of accuracy are made. SCUBA diving, especially that which occurs in an overhead environment is inherently dangerous and requires specific training. Use Depth at your own risk.</p>
                <button onClick={hideDisclaimer}>Accept</button>
                <RejectButton onClick={() => window.location = 'http://example.com'}>Decline</RejectButton>
            </Disclaimer>}

            <PageContainer>
                <h1>Depth</h1>

                <FormGroup>
                    <label for='mode'>Mode</label>
                    <select name='mode' onChange={updateForm} value={form.mode}>
                        <option value='ccr'>Closed Circut Rebreather</option>
                        <option value='oc'>Open Circut</option>
                    </select>

                    <label for='salinity'>Water Type</label>
                    <select name='salinity' onChange={updateForm} value={form.salinity}>
                        <option value='fresh'>Fresh Water</option>
                        <option value='salt'>Salt Water</option>
                    </select>

                    <label for='totalGas'>Total Gas (cf.)</label>
                    <input placeholder='Total Gas (cf.)' type='number' step='0.01' name='totalGas' onChange={updateForm} value={form.totalGas} />

                    <label for='depth'>Depth (ft.)</label>
                    <input placeholder='Depth' type='number' step='0.01' name='depth' onChange={updateForm} value={form.depth} />

                    {form.mode === 'oc' && <FormGroup>
                        <label for='penetrationRate'>Penetration Rate (ft/min)</label>
                        <input placeholder='Penetration Rate (ft/min)' type='number' step='0.01' name='penetrationRate' onChange={updateForm} value={form.penetrationRate} />

                        <label for='sacPenetration'>Penetration SAC Rate</label>
                        <input placeholder='Penetration SAC Rate' type='number' step='0.01' name='sacPenetration' onChange={updateForm} value={form.sacPenetration}/>
                    </FormGroup>}

                    <label for='exitRate'>Exit Rate (ft/min)</label>
                    <input placeholder='Exit Rate (ft/min)' type='number' step='0.01' name='exitRate' onChange={updateForm} value={form.exitRate} />

                    <label for='sacExit'>Exit SAC Rate</label>
                    <input placeholder='Exit SAC Rate' type='number' step='0.01' name='sacExit' onChange={updateForm} value={form.sacExit} />

                    <button onClick={calculate}>Calculate</button>
                </FormGroup>

                {result && <b>Maximum of {result} ft.</b>}
            </PageContainer>
        </>
    );
}

export default IndexPage
