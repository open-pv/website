import App from '@/app/App'
import Footer from '@/components/layout/Footer'
import { Box, Button, Card, Heading, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

const NotFound = () => (
  <>
    <App title='404 - Page Not Found'>
      <Box
        display='flex'
        alignItems='center'
        justifyContent='center'
        flexGrow={1}
        padding='20px'
      >
        <Card.Root
          maxWidth='480px'
          width='100%'
          padding='40px'
          textAlign='center'
        >
          <Card.Header>
            <Heading as='h1' size='4xl' color='gray.400'>
              404
            </Heading>
            <Heading as='h2' size='lg' marginTop='8px'>
              Page Not Found
            </Heading>
          </Card.Header>
          <Card.Body>
            <Text color='gray.500' marginBottom='24px'>
              The page you are looking for does not exist.
            </Text>
            <Button as={Link} to='/' colorScheme='teal'>
              Back to Home
            </Button>
          </Card.Body>
        </Card.Root>
      </Box>
    </App>
    <Footer />
  </>
)

export default NotFound
