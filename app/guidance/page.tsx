import type { Metadata } from "next";
import GuidanceApp from "@/components/guidance/GuidanceApp";

export const metadata: Metadata = {
  title: "แนะแนว | suvicha.life",
  description: "หลักสูตรแนะแนว โรงเรียนเบญจมราชูทิศ ราชบุรี — เส้นทาง การเงิน เพศศึกษา สุขภาพจิต พหุปัญญา และ Time Management",
};

export default function GuidancePage() {
  return <GuidanceApp />;
}
