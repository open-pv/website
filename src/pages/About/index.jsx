import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from '@/components/ui/accordion'
import {
  Box,
  Card,
  Heading,
  Image,
  Link,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Footer from '@/components/layout/Footer'

import App from '@/app/App'

const About = () => {
  const { t } = useTranslation()
  return (
    <>
      <App title={t('about.title')} description={t('about.description')}>
        <Card.Root height='100%' overflow='auto' padding={'20px'}>
          <Card.Header>
            <Heading as='h1'>{t('about.title')}</Heading>
          </Card.Header>
          <Card.Body>
            <Text>{t('about.introduction')}</Text>
            <AccordionRoot multiple>
              <AccordionItem value={0}>
                <AccordionItemTrigger>
                  {t('about.generalDescription.h')}
                </AccordionItemTrigger>
                <AccordionItemContent>
                  <p>{t('about.generalDescription.p')}</p>
                  <Text fontWeight='semibold'>
                    {t('about.steps.introduction')}
                  </Text>
                  <Box as='ul'>
                    <li>{t('about.steps.1')}</li>
                    <li>{t('about.steps.2')}</li>
                    <li>{t('about.steps.3')}</li>
                    <li>{t('about.steps.4')}</li>
                  </Box>
                  <ImageRow
                    images={[
                      'images/about/about1.png',
                      'images/WelcomeMessage2.png',
                      'images/WelcomeMessage3.png',
                    ]}
                    alttext={[
                      'Screenshot of the map that is visible on the start screen of openpv.de.',
                      'Screenhot of a simulated building.',
                      'Screenshot of a PV system that is drawn on a simulated building together with an estimated annual PV yield.',
                    ]}
                  />
                </AccordionItemContent>
              </AccordionItem>
              <AccordionItem value={1}>
                <AccordionItemTrigger>{t('about.data.h')}</AccordionItemTrigger>
                <AccordionItemContent>
                  {t('about.data.p1')}{' '}
                  <Link
                    href='https://www.dwd.de/DE/leistungen/cdc/climate-data-center.html'
                    isExternal
                    color='teal'
                  >
                    {'[CC-BY-4.0]'}
                  </Link>
                  {', '}
                  {t('about.data.p2')}{' '}
                  <Link href='https://sonny.4lima.de/' isExternal color='teal'>
                    {'[CC-BY-4.0]'}
                  </Link>
                  {', '}
                  {t('about.data.p3')}{' '}
                  <Link
                    href='https://www.bkg.bund.de/DE/Home/home.html'
                    isExternal
                    color='teal'
                  >
                    {'[DL-DE/BY-2-0]'}
                  </Link>
                  {'. '}
                </AccordionItemContent>
              </AccordionItem>
              <AccordionItem value={2}>
                <AccordionItemTrigger>
                  {t('about.whyOpenSource.h')}
                </AccordionItemTrigger>
                <AccordionItemContent>
                  {t('about.whyOpenSource.p')}
                </AccordionItemContent>
              </AccordionItem>
              <AccordionItem value={3}>
                <AccordionItemTrigger>{t('about.team.h')}</AccordionItemTrigger>
                <AccordionItemContent>
                  <p>{t('about.team.p')}</p>
                  <Link
                    href='https://github.com/orgs/open-pv/people'
                    isExternal
                    color='teal'
                  >
                    {t('about.team.link')}
                  </Link>
                </AccordionItemContent>
              </AccordionItem>

              <AccordionItem value={4}>
                <AccordionItemTrigger>
                  {t('about.sponsors.h')}
                </AccordionItemTrigger>
                <AccordionItemContent>
                  <p>{t('about.sponsors.p')}</p>
                  <ImageRow
                    images={['images/about/ptf.png', 'images/about/bmbf.jpg']}
                    alttext={[
                      'Logo of the Prototypefund.',
                      'Logo of the German Federal Ministry of Education and Research.',
                    ]}
                    links={['https://prototypefund.de/', 'https://www.bmbf.de']}
                    objectFit='contain'
                  />
                </AccordionItemContent>
              </AccordionItem>
            </AccordionRoot>
          </Card.Body>
        </Card.Root>
      </App>
      <Footer />
    </>
  )
}

export default About

const ImageRow = ({ images, alttext, links = [], objectFit = 'cover' }) => {
  return (
    <SimpleGrid columns={images.length} spacing={4}>
      {images.map((src, index) => {
        const imageContent = (
          <Image
            src={src}
            objectFit={objectFit}
            width='100%'
            height='150px'
            borderRadius='md'
            alt={alttext[index]}
          />
        )

        return (
          <Box key={index} padding={2}>
            {links[index] ? (
              <Link href={links[index]} isExternal>
                {imageContent}
              </Link>
            ) : (
              imageContent
            )}
          </Box>
        )
      })}
    </SimpleGrid>
  )
}
