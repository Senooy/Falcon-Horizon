import {
  Button,
  Flex,
  Image,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import logoWhite from "assets/img/layout/logoWhite.png";
import React from "react";

export default function SidebarDocs() {
  const bgColor = "linear-gradient(135deg, #868CFF 0%, #4318FF 100%)";
  const borderColor = useColorModeValue("white", "navy.800");

  return (
    <Flex
      justify='center'
      direction='column'
      align='center'
      bg='linear-gradient(135deg, #1D3E5F 0%, #1D3E5F 100%)'
      borderRadius='30px'
      me='20px'
      position='relative'>
      <Flex
        border='5px solid'
        borderColor={borderColor}
        bg='linear-gradient(135deg, #1D3E5F 0%, #1D3E5F 100%)'
        borderRadius='50%'
        w='94px'
        h='94px'
        align='center'
        justify='center'
        mx='auto'
        position='absolute'
        left='50%'
        top='-47px'
        transform='translate(-50%, 0%)'>
        <Image src={logoWhite} w='60px' h='60px' />
      </Flex>
      <Flex
        direction='column'
        mb='12px'
        align='center'
        justify='center'
        px='15px'
        pt='55px'>
        <Text
          fontSize={{ base: "lg", xl: "18px" }}
          color='white'
          fontWeight='bold'
          lineHeight='150%'
          textAlign='center'
          px='10px'
          mb='14px'>
          Important
        </Text>
        <Text
          fontSize='14px'
          color={"white"}
          px='10px'
          mb='14px'
          textAlign='center'>
          Cooptation obligatoire : 300€ par recrutement
        </Text>
      </Flex>
      <Link href='https://docs.google.com/forms/d/e/1FAIpQLSd-5qONV_spBiHlFnwrH5xsd-roTkGkshJ97N5Vlp4DPYCanw/viewform?vc=0&c=0&w=1&flr=0'>
        <Button
          bg='whiteAlpha.300'
          _hover={{ bg: "whiteAlpha.200" }}
          _active={{ bg: "whiteAlpha.100" }}
          mb={{ sm: "16px", xl: "24px" }}
          color={"white"}
          fontWeight='regular'
          fontSize='sm'
          minW='185px'
          mx='auto'>
          Formulaire
        </Button>
      </Link>
    </Flex>
  );
}
