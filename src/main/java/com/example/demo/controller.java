package com.example.demo;

import com.alibaba.fastjson.JSON;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;

/**
 * @Author: xinzhifu
 * @Description:
 */
@Controller
@RequestMapping
public class controller {


    @RequestMapping("index")
    @ResponseBody
    public String index1(String one) throws IOException {
        Process exec = Runtime.getRuntime().exec("/data/arthas.sh");

       /* InputStream inputStream = exec.getInputStream();

        InputStreamReader reader = new InputStreamReader(inputStream, "utf-8");
        BufferedReader br = new BufferedReader(reader);
        String s = null;
        StringBuffer sb = new StringBuffer();
        while ((s = br.readLine()) != null) {
            sb.append(s + "\r\n");
        }
        s = sb.toString();*/

        return "arthas 启动成功！" + JSON.toJSONString(exec);
    }

    @RequestMapping("html")
    public String html(String one) throws IOException {

        return "index";
    }


//    @RequestMapping("index2")
//    @ResponseBody
//    public String index2(String two) {
//
//        for (int i = 0; i < 1000; i++) {
//            System.out.println("uuid = " + uuidOne());
//            try {
//                Thread.sleep(1000);
//            } catch (InterruptedException e) {
//                e.printStackTrace();
//            }
//            //throw new IllegalArgumentException("测试异常");
//        }
//        return "index2";
//    }
//
//
//    public static String uuidOne() {
//        return uuidTwo();
//    }
//
//    public static String uuidTwo() {
//        return UUID.randomUUID().toString().replaceAll("-", "");
//    }
}
