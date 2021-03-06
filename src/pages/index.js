import './global.css'

import * as React from 'react'
import { Helmet } from 'react-helmet'
import styled from '@emotion/styled'

import { planOC, planCCR, planCCRBailoutDrops, planOCStageDrops } from '../planner'
import GasPlanner from '../components/gasPlanner'

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

const Plan = styled.div`
    border-radius: 10px;
    ${'' /* background: #f1f1f1; */}
    border: dashed 3px #f1f1f1;

    padding: 15px;
`;

const IndexPage = () => {
    const [result, setResult] = React.useState(0);
    const [drops, setDrops] = React.useState([]);
    const [showDisclaimer, setShowDisclaimer] = React.useState(false);
    const [form, updateForm] = React.useReducer((currentFields, event) => {
        const newForm = {
            ...currentFields,
            [event.target.name]: event.target.type === 'number' ? parseFloat(event.target.value) : event.target.value
        };

        if (newForm.mode === 'oc') {
            setResult(planOC(newForm));
        } else if (newForm.mode === 'ccr') {
            setResult(planCCR(newForm));
        }

        localStorage.setItem('form', JSON.stringify(newForm));
        return newForm;
    }, {
        mode: 'ccr',
        salinity: 'fresh'
    });

    React.useEffect(() => {
        const formState = JSON.parse(window.localStorage.getItem('form'));
        setShowDisclaimer(window.localStorage.getItem('showDisclaimer') !== 'false');

        if (formState) {
            Object.keys(formState).map(field => updateForm({
                target: {
                    name: field,
                    value: formState[field],
                }
            }));
        }
    }, []);

    React.useEffect(() => {
        const tanks = form.tanks ?? [];
        setDrops(
            form.mode === 'ccr' ?
                planCCRBailoutDrops(tanks, form.totalGas ?? 0, result, form.mode)
                : planOCStageDrops(tanks, form.penetrationRate, form.sacPenetration)
        );
    }, [form, result]);

    const hideDisclaimer = () => {
        setShowDisclaimer(false);
        window.localStorage.setItem('showDisclaimer', false);
    }

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

                    <GasPlanner onChange={(totalGas, tanks) => {
                        updateForm({target: {
                            name: 'totalGas',
                            value: totalGas,
                        }});

                        updateForm({target: {
                            name: 'tanks',
                            value: tanks,
                        }});
                    }} />

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
                </FormGroup>
                
                <Plan>
                    <b>Dive Plan</b>

                    {result > 0 && !Number.isNaN(result) && result !== 0 ? <div>Max Penetration: {result} ft.</div> : null}

                    {drops.length > 0 && <table>
                        {form.mode === 'ccr' ? <tr>
                            <td>Bailout</td>
                            <td>Stage At</td>
                        </tr> : <tr>
                            <td>Stage</td>
                            <td>Estimated Drop</td>
                        </tr>}

                        {drops.map(drop => <tr>
                            <td>{drop.tank.name}</td>
                            <td>{drop.penetration} ft.</td>
                        </tr>)}
                    </table>}
                </Plan>
            </PageContainer>
        </>
    );
}

export default IndexPage
