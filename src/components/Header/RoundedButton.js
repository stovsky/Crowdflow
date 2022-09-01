import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'

/* Rounded button component - only used in mobile header
    Extract to main components folder if needed for usage later on in other components than header
*/

const RoundedButton = styled(Button)({
  borderRadius: '10px',
  backgroundColor: 'rgba(255, 255,255, 0.2)',
  color: 'white',
  border: '1px solid white',
  fontSize: '12px',
  margin: '0 1em',
  padding: '0 2em',
})

export default RoundedButton
